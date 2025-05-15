// /server/routes/admin/import/import_extra.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// ✅ 전체 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM import_extra_items ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Extra 항목 조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// ✅ 등록
router.post('/add', async (req, res) => {
  const { po_id, type, category, description, amount, apply_exrate } = req.body;
  try {
    await db.query(
      `INSERT INTO import_extra_items
       (po_id, type, category, description, amount, apply_exrate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [po_id, type, category, description, amount, apply_exrate ? 1 : 0]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Extra 항목 등록 오류:', err);
    res.status(500).json({ error: '등록 실패' });
  }
});

// ✅ 삭제
router.post('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM import_extra_items WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: '삭제할 항목 없음' });
    res.json({ success: true });
  } catch (err) {
    console.error('Extra 항목 삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
