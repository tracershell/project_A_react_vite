const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

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

router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { date_value, number_value, name_value } = req.body;
  try {
    await db.query(
      'UPDATE dbtest SET date_value = ?, number_value = ?, name_value = ? WHERE id = ?',
      [date_value, number_value, name_value, id]
    );
    res.json({ message: '데이터가 수정되었습니다.' });
  } catch (err) {
    console.error('데이터 수정 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// ✅ DELETE: 값 삭제
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM dbtest WHERE id = ?', [id]);
    res.json({ message: '데이터가 삭제되었습니다.' });
  } catch (err) {
    console.error('데이터 삭제 오류:', err);
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

router.get('/view/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM dbtest WHERE id = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: '레코드를 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
