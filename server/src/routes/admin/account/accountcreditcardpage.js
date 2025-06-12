// 📁 server/routes/admin/account/accountcreditcardpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// ✅ meta 정보: pdate, provider 목록
router.get('/meta', async (req, res) => {
  try {
    const [pdates] = await db.query(`SELECT DISTINCT pdate FROM creditcard_data ORDER BY pdate DESC`);
    const [providers] = await db.query(`SELECT DISTINCT provider FROM creditcard_data ORDER BY provider ASC`);
    res.json({ pdates, providers });
  } catch (err) {
    console.error('meta 조회 오류:', err);
    res.status(500).json({ error: 'meta 조회 실패' });
  }
});

// ✅ 특정 pdate + provider에 대한 결제 요약 정보 (header info)
router.get('/summary', async (req, res) => {
  const { pdate, provider } = req.query;
  if (!pdate || !provider) return res.status(400).json({ error: '필수 항목 누락' });

  try {
    const [rows] = await db.query(
      `SELECT ptype, ptname, pamount, anumber FROM creditcard_data
       WHERE pdate = ? AND provider = ? LIMIT 1`,
      [pdate, provider]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error('summary 조회 오류:', err);
    res.status(500).json({ error: 'summary 조회 실패' });
  }
});

// ✅ 특정 pdate + provider에 대한 항목별 합계
router.get('/details', async (req, res) => {
  const { pdate, provider } = req.query;
  if (!pdate || !provider) return res.status(400).json({ error: '필수 항목 누락' });

  try {
    const [rows] = await db.query(
      `SELECT aitem, SUM(uamount) AS total
       FROM creditcard_data
       WHERE pdate = ? AND provider = ?
       GROUP BY aitem
       ORDER BY aitem ASC`,
      [pdate, provider]
    );
    res.json(rows);
  } catch (err) {
    console.error('details 조회 오류:', err);
    res.status(500).json({ error: '상세 내역 조회 실패' });
  }
});

module.exports = router;
