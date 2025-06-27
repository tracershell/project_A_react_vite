// 📁 server/src/routes/family/alexis/alexisphotopage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// ✅ GET photos filtered by year & month where code = 'Alexis'
router.get('/', async (req, res) => {
  const { year, month } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT id, original, thumbnail, comment 
       FROM personal_photo 
       WHERE code = 'Alexis' AND YEAR(date) = ? AND MONTH(date) = ?
       ORDER BY date DESC`,
      [year, month]
    );
    res.json({ photos: rows });
  } catch (err) {
    console.error('Alexis 사진 조회 오류:', err);
    res.status(500).json({ error: '사진 조회 실패', details: err.message });
  }
});

// ✅ GET distinct years
router.get('/years', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT YEAR(date) AS year FROM personal_photo 
       WHERE code = 'Alexis' ORDER BY year DESC`
    );
    res.json({ years: rows.map(r => r.year) });
  } catch (err) {
    console.error('년도 조회 오류:', err);
    res.status(500).json({ error: '년도 조회 실패', details: err.message });
  }
});

// ✅ GET distinct months by year
router.get('/months', async (req, res) => {
  const { year } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT MONTH(date) AS month FROM personal_photo 
       WHERE code = 'Alexis' AND YEAR(date) = ? ORDER BY month ASC`,
      [year]
    );
    res.json({ months: rows.map(r => r.month) });
  } catch (err) {
    console.error('월 조회 오류:', err);
    res.status(500).json({ error: '월 조회 실패', details: err.message });
  }
});

module.exports = router;
