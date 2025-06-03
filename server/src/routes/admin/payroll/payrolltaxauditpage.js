// server/src/routes/admin/payroll/payrolltaxauditpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generatePayrollTaxAuditPDF = require('../../../utils/generatePayrollTaxAuditPDF');

// 날짜 형식 정리 함수
const cleanDate = (date) => {
  if (!date) return null;
  return date.split('T')[0]; // '2025-06-06T00:00:00.000Z' → '2025-06-06'
};

// 1) 직원 목록 (Audit에 필요할 수도 있으므로 포함)
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

// 2) Audit PDF 생성
router.get(['/pdf', '/pdfdownload'], async (req, res) => {
  const { start, end } = req.query;
  const isDownload = req.path.includes('download');

  if (!start || !end) return res.status(400).send('시작일과 종료일이 필요합니다.');

  try {
    
       // ✂ pdate, ckno, remark 원본에서 SELECT 하도록 추가
   const [rows] = await db.query(
     `SELECT eid,
             name,
             jtitle,
             jcode,
             gross,
             rtime,
             otime,
             dtime,
             pdate,      -- Pay Date
             ckno,       -- Check No.
             remark      -- Remark
      FROM payroll_tax
      WHERE pdate BETWEEN ? AND ?
      ORDER BY name, pdate ASC`,
     [start, end]
   );

    const grouped = {};
    for (const row of records) {
      const key = `${row.eid}||${row.name}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }

    await generatePayrollTaxAuditPDF(res, grouped, start, end, isDownload);
  } catch (err) {
    console.error('Audit PDF 생성 오류:', err);
    res.status(500).send('Audit PDF 생성 실패');
  }
});

// ✅ 3) 기간 내 payroll_tax 데이터를 그대로 반환하는 API
router.get('/audit-result', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
  return res.status(400).json({ error: '시작일과 종료일이 필요합니다.' });
}

  try {
    const [rows] = await db.query(
      `SELECT eid, name, jtitle, jcode, gross, rtime, otime, dtime, pdate, ckno, remark
       FROM payroll_tax
       WHERE pdate BETWEEN ? AND ?
       ORDER BY name`,
      [start, end]
    );
    res.json(rows); // ✅ 프론트로 전달
  } catch (e) {
    console.error('기간별 데이터 조회 오류:', e);
    res.status(500).json({ error: '조회 실패' });
  }
});


module.exports = router;
