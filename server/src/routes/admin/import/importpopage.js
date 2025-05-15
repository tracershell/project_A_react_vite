const express = require('express');
const router = express.Router();
const db     = require('../../../lib/db');

// 전체 조회 (JOIN으로 vendor 이름·rate 포함)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, v.name AS vendor_name, v.deposit_rate
      FROM import_po p
      JOIN import_vendors v ON p.vendor_id = v.id
      ORDER BY p.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('DB 조회 오류:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PO 추가 (중복 검사)
router.post('/add', async (req, res) => {
  const { vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note } = req.body;
  try {
    const [dup] = await db.query(
      'SELECT COUNT(*) AS cnt FROM import_po WHERE po_no = ?',
      [po_no]
    );
    if (dup[0].cnt > 0) {
      return res.status(400).json({ error: '중복된 PO 번호입니다.' });
    }
    await db.query(
      `INSERT INTO import_po
         (vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('추가 오류:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// PO 수정 (중복 검사)
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note } = req.body;
  try {
    // PO 번호 변경 시에도 중복 검사
    const [dup] = await db.query(
      'SELECT COUNT(*) AS cnt FROM import_po WHERE po_no = ? AND id <> ?',
      [po_no, id]
    );
    if (dup[0].cnt > 0) {
      return res.status(400).json({ error: '중복된 PO 번호입니다.' });
    }
    const [result] = await db.query(
      `UPDATE import_po SET
         vendor_id = ?,
         po_date   = ?,
         style_no  = ?,
         po_no     = ?,
         pcs       = ?,
         cost_rmb  = ?,
         note      = ?
       WHERE id = ?`,
      [vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'PO를 찾을 수 없습니다.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// PO 삭제
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM import_po WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'PO를 찾을 수 없습니다.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;