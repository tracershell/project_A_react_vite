// ✅ File: server/src/routes/admin/payroll/payrollindividualpage.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateAuditIndividualPDF = require('../../../utils/generateAuditIndividualPDF'); // ✅ 상단에 추가
const generatePayrollIndividualCSV = require('../../../utils/generatePayrollIndividualCSV'); 

// ✅ 날짜 형식 정리 함수
const cleanDate = (date) => {
  if (!date) return null;
  return date.split('T')[0]; // '2025-06-06T00:00:00.000Z' → '2025-06-06'
};

// ✅ 직원 목록 (선택 필드가 필요할 경우)
router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, name, jcode, jtitle, workl FROM employees WHERE status='active'`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '직원 목록 조회 실패' });
  }
});

// ✅ 개인별 감사 결과 조회 API
router.get('/audit-result', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: '시작일과 종료일을 입력해주세요.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT eid, name, jtitle, jcode, gross, rtime, otime, dtime, pdate, ckno, remark
       FROM payroll_tax
       WHERE pdate BETWEEN ? AND ?
       ORDER BY name, pdate ASC`,
      [start, end]
    );
    res.json(rows);
  } catch (e) {
    console.error('기간별 감사 데이터 조회 오류:', e);
    res.status(500).json({ error: '서버 오류로 데이터를 불러오지 못했습니다.' });
  }
});

// ✅ 개인별 PDF 생성 라우트 추가
router.post('/pdf/individual', async (req, res) => {
  const { start, end, payrecords } = req.body;
  if (!start || !end || !Array.isArray(payrecords) || payrecords.length === 0) {
    return res.status(400).send('유효한 데이터가 필요합니다.');
  }

  try {
    await generateAuditIndividualPDF(res, payrecords, start, end); // ✅ PDF 생성
  } catch (err) {
    console.error('개인별 PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 중 오류 발생');
  }
});


 // CSV 저장용 라우트 추가
 // GET /api/admin/payroll/payrollindividual/csv?start=YYYY-MM-DD&end=YYYY-MM-DD
 
router.get('/csv', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).send('시작일(start)과 종료일(end) 쿼리가 필요합니다.');
  }

  try {
    // 1) 기간 내 payrecords 모두 조회
    const [rows] = await db.query(
      `SELECT eid, name, jtitle, jcode, gross, rtime, otime, dtime, pdate, ckno, remark
       FROM payroll_tax
       WHERE pdate BETWEEN ? AND ?
       ORDER BY name, pdate ASC`,
      [start, end]
    );

    if (rows.length === 0) {
      return res.status(404).send('해당 기간에 데이터가 없습니다.');
    }

    // 2) CSV 생성 함수에 넘기기
    await generatePayrollIndividualCSV(res, rows);
  } catch (err) {
    console.error('개인별 CSV 생성 오류:', err);
    res.status(500).send('CSV 생성 중 오류가 발생했습니다: ' + err.message);
  }
});



module.exports = router;
