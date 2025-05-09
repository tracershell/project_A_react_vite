const express = require('express');
const router = express.Router();
const db = require('../../../lib/db'); // mysql2/promise 연결 모듈

// POST: 값 추가
router.post('/add', async (req, res) => {
  const { date_value, number_value, name_value } = req.body;
  try {
    await db.query(
      'INSERT INTO dbtest (date_value, number_value, name_value) VALUES (?, ?, ?)',
      [date_value, number_value, name_value]
    );
    res.json({ message: '데이터가 저장되었습니다.' });
  } catch (err) {
    console.error('데이터 저장 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// GET: 값 조회 (선택사항)
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dbtest ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('데이터 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
