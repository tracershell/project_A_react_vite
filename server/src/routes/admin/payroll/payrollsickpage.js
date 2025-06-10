// server/src/routes/admin/payroll/payrollsickpage.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateSickPDF = require('../../../utils/admin/payroll/generateSickPDF');
const generatePvPDF = require('../../../utils/admin/payroll/generatePvPDF');
// (파일 상단에 cleanDate 함수가 필요 없다면 생략)

router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, name
       FROM employees
       WHERE status='active'
       ORDER BY name ASC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('SickPage 직원 목록 조회 에러:', err);
    return res.status(500).json({ error: '직원 목록 조회 실패' });
  }
});


// ✅ 수정된 /summary API
router.get('/summary', async (req, res) => {
  const { eid } = req.query;
  try {
    const [given] = await db.query(`
      SELECT g.eid, e.name, g.sickgiven, g.pvgiven
      FROM sickpv_given g
      JOIN employees e ON g.eid = e.eid
      ${eid ? 'WHERE g.eid = ?' : ''}
    `, eid ? [eid] : []);

    // sick 사용량 (sickdate 기준)
    const [sickUse] = await db.query(`
      SELECT eid, MONTH(sickdate) AS month, SUM(sickhour) AS sick
      FROM sickpv_data
      WHERE sickdate IS NOT NULL
      ${eid ? 'AND eid = ?' : ''}
      GROUP BY eid, MONTH(sickdate)
    `, eid ? [eid] : []);

    // pv 사용량 (pvdate 기준)
    const [pvUse] = await db.query(`
      SELECT eid, MONTH(pvdate) AS month, SUM(pvhour) AS pv
      FROM sickpv_data
      WHERE pvdate IS NOT NULL
      ${eid ? 'AND eid = ?' : ''}
      GROUP BY eid, MONTH(pvdate)
    `, eid ? [eid] : []);

    const result = given.map(g => {
      const entry = {
        EID: g.eid,
        NAME: g.name,
        SickGiven: parseFloat(g.sickgiven),
        PVGiven: parseFloat(g.pvgiven),
        SickRemain: parseFloat(g.sickgiven),
        PVRemain: parseFloat(g.pvgiven),
      };

      for (let m = 1; m <= 12; m++) {
        const mon = new Date(2000, m - 1).toLocaleString('en-US', { month: 'short' });

        const sick = sickUse.find(u => u.eid === g.eid && u.month === m)?.sick || 0;
        const pv = pvUse.find(u => u.eid === g.eid && u.month === m)?.pv || 0;

        entry[`${mon}_S`] = parseFloat(sick);
        entry[`${mon}_PV`] = parseFloat(pv);

        entry.SickRemain -= parseFloat(sick);
        entry.PVRemain -= parseFloat(pv);
      }

      return entry;
    });

    res.json(result);
  } catch (err) {
    console.error('SickPage summary 생성 실패:', err);
    res.status(500).json({ error: '요약 데이터 생성 실패' });
  }
});

router.post('/pdf/sick', async (req, res) => {
  const { summaryData } = req.body;
  if (!Array.isArray(summaryData) || summaryData.length === 0) {
    return res.status(400).send('유효한 Sick 데이터가 필요합니다.');
  }
  try {
    await generateSickPDF(res, summaryData);
  } catch (err) {
    console.error('Sick PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 중 오류 발생');
  }
});

router.post('/pdf/pv', async (req, res) => {
  const { summaryData } = req.body;
  if (!Array.isArray(summaryData) || summaryData.length === 0) {
    return res.status(400).send('유효한 PV 데이터가 필요합니다.');
  }
  try {
    await generatePvPDF(res, summaryData);
  } catch (err) {
    console.error('PV PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 중 오류 발생');
  }
});



module.exports = router;
