const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// GET: 목록 조회
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dbtest ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// PUT: 수정
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { date_value, number_value, name_value } = req.body;
  try {
    await db.query(
      'UPDATE dbtest SET date_value=?, number_value=?, name_value=? WHERE id=?',
      [date_value, number_value, name_value, id]
    );
    res.json({ message: '수정되었습니다.' });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// DELETE: 삭제
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM dbtest WHERE id = ?', [id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
