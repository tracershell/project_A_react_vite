const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateApReportPDF = require('../../../utils/admin/account/generateApReportPDF');

// 마지막 날짜 생성기: year, month(1~12) → 'YYYY-MM-DD'
const getEndDate = (year, month) => {
  const lastDay = new Date(year, month, 0);
  return lastDay.toISOString().split('T')[0];
};

// ✅ ap_purchase_temp, ap_payment_temp 재생성 함수
async function regenerateApTempTables() {
  // 1) 테이블이 존재하지 않으면 생성 (컬럼 타입 및 이름 확인)
  await db.query(`
    CREATE TABLE IF NOT EXISTS ap_purchase_temp (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pur_date DATE,
      pur_amount DECIMAL(14, 2)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS ap_payment_temp (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pay_date DATE,
      pay_amount DECIMAL(14, 2)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2) 테이블 초기화
  await db.query(`TRUNCATE TABLE ap_purchase_temp`);
  // INSERT: apar_preparation 테이블의 컬럼명이 실제로 po_amount_usd 등인 점 주의
  await db.query(`
    INSERT INTO ap_purchase_temp (pur_date, pur_amount)
    SELECT po_date AS pur_date, po_amount_usd AS pur_amount
      FROM apar_preparation
     WHERE po_date IS NOT NULL
       AND po_amount_usd IS NOT NULL
  `);

  await db.query(`TRUNCATE TABLE ap_payment_temp`);
  // Payment: dp_date/dp_amount_usd, bp_date/bp_amount_usd
  // UNION ALL 로 묶어서 한 번에 조회
  const [paymentRows] = await db.query(`
    SELECT dp_date AS pay_date, dp_amount_usd AS pay_amount
      FROM apar_preparation
     WHERE dp_date IS NOT NULL
       AND dp_amount_usd IS NOT NULL
    UNION ALL
    SELECT bp_date AS pay_date, bp_amount_usd AS pay_amount
      FROM apar_preparation
     WHERE bp_date IS NOT NULL
       AND bp_amount_usd IS NOT NULL
  `);
  // bulk insert
  if (Array.isArray(paymentRows) && paymentRows.length > 0) {
    // MySQL의 bulk insert 가능: 한 번에 여러 VALUES 로 넣기
    // 다만 row 수가 많으면 분할 필요. 여기선 단순하게 여러 row를 loop로 insert 하거나 bulk로 묶을 수 있음.
    // 예: bulk INSERT INTO ... VALUES (?, ?), (?, ?), ...
    // 간단히 loop로 처리:
    for (const row of paymentRows) {
      // pay_date, pay_amount이 모두 null 아닌 경우만
      if (row.pay_date && row.pay_amount != null) {
        await db.query(
          `INSERT INTO ap_payment_temp (pay_date, pay_amount) VALUES (?, ?)`,
          [row.pay_date, row.pay_amount]
        );
      }
    }
  }
}

// GET /api/admin/account/ap?year=YYYY
router.get('/', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  if (isNaN(year)) {
    return res.status(400).json({ error: '올바른 year 파라미터가 필요합니다.' });
  }

  // 매 요청마다 최신 apar_preparation 반영
  try {
    await regenerateApTempTables();
  } catch (err) {
    console.error('Temp 테이블 재생성 오류:', err);
    return res.status(500).json({ error: '임시 테이블 생성/초기화 중 오류 발생' });
  }

  // 월말일 리스트
  const endDates = Array.from({ length: 12 }, (_, i) => getEndDate(year, i + 1));

  try {
    // 1) 시작잔액 조회
    const [beginRows] = await db.query(`SELECT beginning_amount FROM ap_beginning LIMIT 1`);
    const beginningAmount = beginRows.length ? Number(beginRows[0].beginning_amount) : 0;

    // 2) 해당 연도 Purchase/Payment 집계
    const [pRows] = await db.query(
      `SELECT pur_date, pur_amount FROM ap_purchase_temp WHERE YEAR(pur_date) = ?`,
      [year]
    );
    const [payRows] = await db.query(
      `SELECT pay_date, pay_amount FROM ap_payment_temp WHERE YEAR(pay_date) = ?`,
      [year]
    );

    // 월별 합계를 배열에 집계
    const toDateObj = (d) => (d instanceof Date ? d : new Date(d));
    const purByMonth = Array.from({ length: 12 }, () => 0);
    const payByMonth = Array.from({ length: 12 }, () => 0);

    pRows.forEach(({ pur_date, pur_amount }) => {
      if (pur_date) {
        const m = toDateObj(pur_date).getMonth(); // 0~11
        purByMonth[m] += Number(pur_amount) || 0;
      }
    });
    payRows.forEach(({ pay_date, pay_amount }) => {
      if (pay_date) {
        const m = toDateObj(pay_date).getMonth();
        payByMonth[m] += Number(pay_amount) || 0;
      }
    });

    // 3) 누적 AP 계산: 매월 순수 pur - pay + 이전 AP
    const monthly = [];
    let prevAp = beginningAmount;
    for (let i = 0; i < 12; i++) {
      const pur = purByMonth[i];
      const pay = payByMonth[i];
      const ap = prevAp + pur - pay;
      monthly.push({
        month_name: `${year}년 ${String(i + 1).padStart(2, '0')}월`, // 01월, 02월 형태로도 원한다면 padStart 적용
        end_date: endDates[i],
        pur_sum: pur,
        pay_sum: pay,
        ap_sum: ap,
      });
      prevAp = ap;
    }

    res.json({ beginning_amount: beginningAmount, monthly });
  } catch (err) {
    console.error('AP 연산 오류:', err);
    res.status(500).json({ error: 'DB 처리 중 오류 발생' });
  }
});

// POST /api/admin/account/ap/beginning
router.post('/beginning', async (req, res) => {
  try {
    const { amount } = req.body;
    const num = Number(amount);
    if (isNaN(num)) {
      return res.status(400).json({ error: '유효한 숫자를 입력하세요.' });
    }
    const [rows] = await db.query(`SELECT * FROM ap_beginning LIMIT 1`);
    if (rows.length === 0) {
      await db.query(`INSERT INTO ap_beginning (beginning_amount) VALUES (?)`, [num]);
    } else {
      await db.query(`UPDATE ap_beginning SET beginning_amount = ?`, [num]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('시작값 저장 오류:', err);
    res.status(500).json({ error: '저장 실패' });
  }
});

// GET /api/admin/account/ap/pdf?year=YYYY
router.get('/pdf', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  if (isNaN(year)) {
    return res.status(400).send('올바른 year 파라미터가 필요합니다.');
  }

  // 매 요청마다 최신 _temp 테이블 반영
  try {
    await regenerateApTempTables();
  } catch (err) {
    console.error('Temp 테이블 재생성 오류 (PDF):', err);
    return res.status(500).send('임시 테이블 생성/초기화 중 오류 발생');
  }

  // 월말일 생성
  const endDates = Array.from({ length: 12 }, (_, i) => getEndDate(year, i + 1));

  try {
    // 시작잔액 조회
    const [beginRows] = await db.query(`SELECT beginning_amount FROM ap_beginning LIMIT 1`);
    const beginningAmount = beginRows.length ? Number(beginRows[0].beginning_amount) : 0;

    // 연도별 Purchase/Payment 조회
    const [pRows] = await db.query(
      `SELECT pur_date, pur_amount FROM ap_purchase_temp WHERE YEAR(pur_date) = ?`,
      [year]
    );
    const [payRows] = await db.query(
      `SELECT pay_date, pay_amount FROM ap_payment_temp WHERE YEAR(pay_date) = ?`,
      [year]
    );

    // 월별 합계 집계
    const toDateObj = (d) => (d instanceof Date ? d : new Date(d));
    const purByMonth = Array.from({ length: 12 }, () => 0);
    const payByMonth = Array.from({ length: 12 }, () => 0);
    pRows.forEach(({ pur_date, pur_amount }) => {
      if (pur_date) {
        const m = toDateObj(pur_date).getMonth();
        purByMonth[m] += Number(pur_amount) || 0;
      }
    });
    payRows.forEach(({ pay_date, pay_amount }) => {
      if (pay_date) {
        const m = toDateObj(pay_date).getMonth();
        payByMonth[m] += Number(pay_amount) || 0;
      }
    });

    // 누적 AP 계산
    const monthly = [];
    let prevAp = beginningAmount;
    for (let i = 0; i < 12; i++) {
      const pur = purByMonth[i];
      const pay = payByMonth[i];
      const ap = prevAp + pur - pay;
      monthly.push({
        month_name: `${year}년 ${String(i + 1).padStart(2, '0')}월`,
        end_date: endDates[i],
        pur_sum: pur,
        pay_sum: pay,
        ap_sum: ap,
      });
      prevAp = ap;
    }

    // PDF 생성: 내부에서 res.pipe로 스트림 전송
    await generateApReportPDF(res, {
      beginning_amount: beginningAmount,
      monthly,
      year,
    });
  } catch (err) {
    console.error('AP PDF 생성 오류:', err);
    res.status(500).send('AP PDF 생성 중 오류 발생');
  }
});

module.exports = router;
