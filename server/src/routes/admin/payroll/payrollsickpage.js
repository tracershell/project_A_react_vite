// server/routes/admin/payroll/sick.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateSickPDF = require('../../../utils/admin/payroll/generateSickPDF');
const generatePvPDF = require('../../../utils/admin/payroll/generatePvPDF');

// 직원 목록 조회 (기존 그대로)
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

// summary 조회 (기존 그대로)
router.get('/summary', async (req, res) => {
  const { eid } = req.query;
  try {
    const [given] = await db.query(
      `
      SELECT g.eid, e.name, g.sickgiven, g.pvgiven
      FROM sickpv_given g
      JOIN employees e ON g.eid = e.eid
      ${eid ? 'WHERE g.eid = ?' : ''}
    `,
      eid ? [eid] : []
    );

    const [sickUse] = await db.query(
      `
      SELECT eid, MONTH(sickdate) AS month, SUM(sickhour) AS sick
      FROM sickpv_data
      WHERE sickdate IS NOT NULL
      ${eid ? 'AND eid = ?' : ''}
      GROUP BY eid, MONTH(sickdate)
    `,
      eid ? [eid] : []
    );

    const [pvUse] = await db.query(
      `
      SELECT eid, MONTH(pvdate) AS month, SUM(pvhour) AS pv
      FROM sickpv_data
      WHERE pvdate IS NOT NULL
      ${eid ? 'AND eid = ?' : ''}
      GROUP BY eid, MONTH(pvdate)
    `,
      eid ? [eid] : []
    );

    const result = given.map(g => {
      const entry = {
        EID: g.eid,
        NAME: g.name,
        SickGiven: parseFloat(g.sickgiven) || 0,
        PVGiven: parseFloat(g.pvgiven) || 0,
        SickRemain: parseFloat(g.sickgiven) || 0,
        PVRemain: parseFloat(g.pvgiven) || 0,
      };

      for (let m = 1; m <= 12; m++) {
        // 고정 영어 월 약어
        const mon = new Date(2000, m - 1).toLocaleString('en-US', { month: 'short' });
        const sick = sickUse.find(u => u.eid === g.eid && u.month === m)?.sick || 0;
        const pv = pvUse.find(u => u.eid === g.eid && u.month === m)?.pv || 0;
        entry[`${mon}_S`] = parseFloat(sick) || 0;
        entry[`${mon}_PV`] = parseFloat(pv) || 0;
        entry.SickRemain -= parseFloat(sick) || 0;
        entry.PVRemain -= parseFloat(pv) || 0;
      }
      return entry;
    });

    res.json(result);
  } catch (err) {
    console.error('SickPage summary 생성 실패:', err);
    res.status(500).json({ error: '요약 데이터 생성 실패' });
  }
});

// POST /pdf/sick
router.post('/pdf/sick', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).send('유효한 Sick 데이터가 필요합니다.');
    }
    // Optional: 각 record 내부 속성 검사
    // for (const rec of records) {
    //   if (!rec.EID || typeof rec.SickGiven !== 'number') {
    //     return res.status(400).send('레코드 형식이 올바르지 않습니다.');
    //   }
    // }
    // PDF 파일명에 타임스탬프 추가 예:
    // res.setHeader('Content-Disposition', `inline; filename=sick_summary_${Date.now()}.pdf`);
    await generateSickPDF(res, records);
  } catch (err) {
    console.error('Sick PDF 생성 오류:', err);
    // 에러가 발생했을 때, 이미 일부 헤더가 설정되었을 수도 있으므로 주의.
    res.status(500).send('PDF 생성 실패');
  }
});

// POST /pdf/pv
router.post('/pdf/pv', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).send('유효한 PV 데이터가 필요합니다.');
    }
    // res.setHeader('Content-Disposition', `inline; filename=pv_summary_${Date.now()}.pdf`);
    await generatePvPDF(res, records);
  } catch (err) {
    console.error('PV PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 실패');
  }
});

// POST /sick/update-remaining
router.post('/update-remaining', async (req, res) => {
  const { records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: '유효한 데이터가 없습니다.' });
  }

  const round2 = val => Math.round(parseFloat(val) * 100) / 100;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const row of records) {
      const { EID, SickRemain, PVRemain } = row;
      if (!EID) continue;

      await conn.query(
  `UPDATE employees SET sick = ?, vac = ? WHERE eid = ?`,
  [round2(SickRemain), round2(PVRemain), EID]
);
    }

    await conn.commit();
    res.status(200).json({ message: '남은 Sick/PV 정보가 업데이트 되었습니다.' });
  } catch (err) {
    await conn.rollback();
    console.error('Sick/PV 잔여 업데이트 실패:', err);
    res.status(500).json({ error: '업데이트 중 서버 오류' });
  } finally {
    conn.release();
  }
});



module.exports = router;
