// 📁 server/src/routes/family/alexis/alexismoviepage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// GET /movie?year=YYYY&month=MM
router.get('/', async (req, res) => {
  const { year, month } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT * FROM personal_movie WHERE keyword='Alexis' AND YEAR(date)=? AND MONTH(date)=? ORDER BY id DESC`,
      [year, month]
    );
    res.json({ movies: rows });
  } catch (err) {
    console.error('Alexis movie 목록 오류:', err);
    res.status(500).json({ error: '영화 불러오기 실패' });
  }
});

router.get('/years', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT YEAR(date) AS year FROM personal_movie WHERE keyword='Alexis' ORDER BY year DESC`
    );
    res.json({ years: rows.map(r => r.year) });
  } catch (err) {
    res.status(500).json({ error: '년도 조회 실패' });
  }
});

router.get('/months', async (req, res) => {
  const { year } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT MONTH(date) AS month FROM personal_movie WHERE keyword='Alexis' AND YEAR(date)=? ORDER BY month`,
      [year]
    );
    res.json({ months: rows.map(r => r.month) });
  } catch (err) {
    res.status(500).json({ error: '월 조회 실패' });
  }
});

module.exports = router;
