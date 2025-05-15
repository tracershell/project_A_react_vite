const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 전체 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM import_extra_items ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('DB 조회 오류:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 추가
router.post('/add', async (req, res) => {
  const { extra_no, po_no, rate_apply, comment } = req.body;
  try {
    await db.query(
      `INSERT INTO import_extra_items
         (extra_no, po_no, rate_apply, comment)
       VALUES (?,?,?,?)`,
      [extra_no, po_no, rate_apply, comment]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('추가 오류:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// 수정
router.put('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const { extra_no, po_no, rate_apply, comment } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE import_extra_items SET
         extra_no=?, po_no=?, rate_apply=?, comment=?
       WHERE id=?`,
      [extra_no, po_no, rate_apply, comment, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 삭제
router.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query(
      'DELETE FROM import_extra_items WHERE id=?', [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
