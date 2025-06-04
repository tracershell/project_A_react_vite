// server/src/routes/admin/payroll/payrollclassificationpage.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

const generateAuditClassificationPDF = require('../../../utils/generateAuditClassificationPDF'); 
const generateAuditClassificationCSV = require('../../../utils/generateAuditClassificationCSV'); 


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


// 2) 분류별 PDF 생성
//    POST /api/admin/payroll/payrollclassification/pdf/classification
router.post('/pdf/classification', async (req, res) => {
  const { start, end, payrecords } = req.body;
  if (!start || !end || !Array.isArray(payrecords) || payrecords.length === 0) {
    return res.status(400).send('유효한 데이터가 필요합니다.');
  }
  try {
    await generateAuditClassificationPDF(res, payrecords, start, end);
  } catch (err) {
    console.error('분류별 PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 중 오류 발생');
  }
});

// 3) 분류별 CSV 생성
//    GET /api/admin/payroll/payrollclassification/csv?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/csv', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).send('시작일(start)과 종료일(end) 쿼리가 필요합니다.');
  }
  try {
    const [rows] = await db.query(
      `SELECT eid, name, jtitle, jcode, gross, rtime, otime, dtime, pdate, ckno, remark
       FROM payroll_tax
       WHERE pdate BETWEEN ? AND ?
       ORDER BY jcode ASC, pdate ASC`,
      [start, end]
    );
    if (rows.length === 0) {
      return res.status(404).send('해당 기간에 데이터가 없습니다.');
    }
    await generateAuditClassificationCSV(res, rows);
  } catch (err) {
    console.error('분류별 CSV 생성 오류:', err);
    res.status(500).send('CSV 생성 중 오류가 발생했습니다: ' + err.message);
  }
});


module.exports = router;
