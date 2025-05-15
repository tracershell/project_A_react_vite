const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 📋 전체 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM import_vendors ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('DB 조회 오류:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ➕ 추가
router.post('/add', async (req, res) => {
  const {
    vendor_id, name, deposit_rate,
    email, phone, street,
    city, state, zip, nation, remark
  } = req.body;
  try {
    await db.query(
      `INSERT INTO import_vendors
       (vendor_id,name,deposit_rate,email,phone,street,city,state,zip,nation,remark)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [vendor_id, name, deposit_rate, email, phone, street, city, state, zip, nation, remark]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('추가 오류:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// ✏️ 수정
router.put('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const {
    name, deposit_rate,
    email, phone, street,
    city, state, zip, nation, remark
  } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE import_vendors SET
         name=?, deposit_rate=?, email=?, phone=?,
         street=?, city=?, state=?, zip=?, nation=?, remark=?
       WHERE id=?`,
      [name, deposit_rate, email, phone, street, city, state, zip, nation, remark, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 🗑️ 삭제
router.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query(
      'DELETE FROM import_vendors WHERE id=?', [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
