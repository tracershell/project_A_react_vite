// 📁 server/src/routes/personal/study/studymusicpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const fs = require('fs');
const path = require('path');

const musicDir = path.join(__dirname, '../../../../public/uploads/personal/music_upload');
const textDir = path.join(__dirname, '../../../../public/uploads/personal/text_upload');

// 📌 GET list
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;
    const [rows] = await db.query(`
      SELECT * FROM personal_music
      WHERE keyword = 'Audio'
        AND YEAR(date) = ?
        AND MONTH(date) = ?
      ORDER BY id DESC
    `, [year, month]);
    res.json(rows);
  } catch (err) {
    console.error('음악 목록 오류:', err);
    res.status(500).json({ error: '목록 조회 실패' });
  }
});

// 📌 GET text
router.get('/text/:filename', (req, res) => {
  const filePath = path.join(textDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('텍스트 없음');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('읽기 실패');
    res.send(data);
  });
});

// 📌 GET years
router.get('/years', async (req, res) => {
  const [rows] = await db.query(`
    SELECT DISTINCT YEAR(date) AS year FROM personal_music
    WHERE keyword = 'Audio'
    ORDER BY year DESC
  `);
  res.json({ years: rows.map(r => r.year) });
});

// 📌 GET months
router.get('/months', async (req, res) => {
  const { year } = req.query;
  const [rows] = await db.query(`
    SELECT DISTINCT MONTH(date) AS month FROM personal_music
    WHERE keyword = 'Audio' AND YEAR(date) = ?
    ORDER BY month ASC
  `, [year]);
  res.json({ months: rows.map(r => r.month) });
});

module.exports = router;
