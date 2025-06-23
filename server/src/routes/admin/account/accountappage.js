// 📁 server/routes/admin/account/accountappage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateApReportPDF = require('../../../utils/admin/account/generateApReportPDF');

// 마지막 날짜 생성기: year, month(1~12) → 'YYYY-MM-DD'
const getEndDate = (year, month) => {
  const lastDay = new Date(year, month, 0);
  return lastDay.toISOString().split('T')[0];
};

router.get('/', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  // year의 각 월 말일을 YYYY-MM-DD 형식으로 생성
  const endDates = Array.from({ length: 12 }, (_, i) => getEndDate(year, i + 1));

  try {
    // 1) 시작잔액 조회
    const [beginRows] = await db.query(`
      SELECT beginning_amount
        FROM ap_beginning
       LIMIT 1
    `);
    const beginAmount = beginRows.length
      ? Number(beginRows[0].beginning_amount)
      : 0;

    // 2) 해당 연도 purchase/pay 데이터 조회
    //    ap_purchase_temp, ap_payment_temp이 이미 최신 데이터로 채워져 있어야 함.
    //    YEAR 조건을 걸어 해당 연도 데이터만 미리 가져오기
    const [pRows] = await db.query(
      `SELECT pur_date, pur_amount 
         FROM ap_purchase_temp 
        WHERE YEAR(pur_date) = ?`,
      [year]
    );
    const [payRows] = await db.query(
      `SELECT pay_date, pay_amount 
         FROM ap_payment_temp
        WHERE YEAR(pay_date) = ?`,
      [year]
    );

    // 3) JS 레벨 날짜 비교용 Date 객체 변환
    const toDateObj = d => (d instanceof Date ? d : new Date(d));
    const pRowsWithDate = pRows.map(r => ({
      date: toDateObj(r.pur_date),
      amount: Number(r.pur_amount),
    }));
    const payRowsWithDate = payRows.map(r => ({
      date: toDateObj(r.pay_date),
      amount: Number(r.pay_amount),
    }));

    // 4) 월별 누적 계산
    const monthly = endDates.map((ed, idx) => {
      // 월말일 Date 객체 (23:59:59 붙이면 포함 비교 안전)
      const edDate = new Date(ed + 'T23:59:59');

      // 선택 연도 1월1일부터 해당 edDate까지 누적 purchase/pay 계산
      const purSumUpToEd = pRowsWithDate
        .filter(r => r.date <= edDate)
        .reduce((sum, r) => sum + r.amount, 0);
      const paySumUpToEd = payRowsWithDate
        .filter(r => r.date <= edDate)
        .reduce((sum, r) => sum + r.amount, 0);

      // Purchase 컬럼: 항상 beginning_amount + 누적Purchase
      const displayPur = beginAmount + purSumUpToEd;

      // AP Report(잔액): beginning_amount + 누적Purchase - 누적Payment
      const apSum = beginAmount + purSumUpToEd - paySumUpToEd;

      return {
        month_name: `${year}년 ${idx + 1}월`,
        end_date: ed,
        pur_sum: displayPur,
        pay_sum: paySumUpToEd,
        ap_sum: apSum,
      };
    });

    // 5) 응답
    res.json({ beginning_amount: beginAmount, monthly });
  } catch (err) {
    console.error('AP 연산 오류:', err);
    res.status(500).json({ error: 'DB 처리 중 오류 발생' });
  }
});

// 시작값 수정 (insert or update)
router.post('/beginning', async (req, res) => {
  try {
    const { amount } = req.body;
    const [rows] = await db.query(`SELECT * FROM ap_beginning LIMIT 1`);
    if (rows.length === 0) {
      await db.query(`INSERT INTO ap_beginning (beginning_amount) VALUES (?)`, [amount]);
    } else {
      await db.query(`UPDATE ap_beginning SET beginning_amount = ?`, [amount]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('시작값 저장 오류:', err);
    res.status(500).json({ error: '저장 실패' });
  }
});

// PDF 생성용 엔드포인트 추가
router.get('/pdf', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  if (isNaN(year)) {
    return res.status(400).send('올바른 year 파라미터가 필요합니다.');
  }

  // 마지막 날짜 생성기: month: 1~12
  const getEndDate = (year, month) => {
    const lastDay = new Date(year, month, 0);
    return lastDay.toISOString().split('T')[0];
  };
  const endDates = Array.from({ length: 12 }, (_, i) => getEndDate(year, i + 1));

  try {
    // 1) 시작잔액 조회
    const [beginRows] = await db.query(`
      SELECT beginning_amount
        FROM ap_beginning
       LIMIT 1
    `);
    const beginAmount = beginRows.length
      ? Number(beginRows[0].beginning_amount)
      : 0;

    // 2) ap_purchase_temp / ap_payment_temp 테이블이 미리 준비되어 있다고 가정.
    //    (만약 필요하다면 여기서 regenerateTempTables 호출 로직을 수행해야 함)
    //    예: await regenerateTempTables();

    // 3) 해당 연도 데이터 조회 (YEAR 조건)
    const [pRows] = await db.query(
      `SELECT pur_date, pur_amount
         FROM ap_purchase_temp
        WHERE YEAR(pur_date) = ?`,
      [year]
    );
    const [payRows] = await db.query(
      `SELECT pay_date, pay_amount
         FROM ap_payment_temp
        WHERE YEAR(pay_date) = ?`,
      [year]
    );

    // 4) JS 레벨로 날짜 비교용 Date 객체 변환
    const toDateObj = d => (d instanceof Date ? d : new Date(d));
    const pRowsWithDate = pRows.map(r => ({
      date: toDateObj(r.pur_date),
      amount: Number(r.pur_amount),
    }));
    const payRowsWithDate = payRows.map(r => ({
      date: toDateObj(r.pay_date),
      amount: Number(r.pay_amount),
    }));

    // 5) 월별 누적 계산: 1월부터 해당 월까지 누적
    const monthly = endDates.map((ed, idx) => {
      const edDate = new Date(ed + 'T23:59:59');

      // 1월 1일부터 edDate까지 누적 purchase/pay
      const purSumUpToEd = pRowsWithDate
        .filter(r => r.date <= edDate)
        .reduce((sum, r) => sum + r.amount, 0);
      const paySumUpToEd = payRowsWithDate
        .filter(r => r.date <= edDate)
        .reduce((sum, r) => sum + r.amount, 0);

      // Purchase 컬럼: beginning_amount + 누적Purchase
      const displayPur = beginAmount + purSumUpToEd;
      // AP Report = beginning_amount + 누적Purchase - 누적Payment
      const apSum = beginAmount + purSumUpToEd - paySumUpToEd;

      return {
        month_name: `${year}년 ${idx + 1}월`,
        end_date: ed,
        pur_sum: displayPur,
        pay_sum: paySumUpToEd,
        ap_sum: apSum,
      };
    });

    // 6) PDF 생성 유틸 호출
    // generateApReportPDF(res, { beginning_amount: beginAmount, monthly, year })
    await generateApReportPDF(res, {
      beginning_amount: beginAmount,
      monthly,
      year,
    });
    // generateApReportPDF 내부에서 res.pipe로 응답 스트림을 처리하고 doc.end() 함.
  } catch (err) {
    console.error('AP PDF 생성 오류:', err);
    res.status(500).send('AP PDF 생성 중 오류 발생');
  }
});

module.exports = router;
