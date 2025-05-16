const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// [1] PO 전체 조회 (검색 지원)
// 전체 조회 (검색 지원, Vendor Name/PO no./Style)
router.get('/', async (req, res) => {
  const { vendor_id, bp_status, keyword } = req.query;
  let sql = `
    SELECT p.*, v.name AS vendor_name, v.deposit_rate
      FROM import_po p
      JOIN import_vendors v ON p.vendor_id = v.id
      WHERE 1=1
  `;
  const params = [];

  if (vendor_id) {
    sql += ' AND p.vendor_id = ?';
    params.push(vendor_id);
  }
  if (bp_status) {
    sql += ' AND p.bp_status = ?';
    params.push(bp_status);
  }
  if (keyword) {
    sql += `
      AND (
        v.name LIKE ? OR
        p.style_no LIKE ? OR
        p.po_no LIKE ?
      )
    `;
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  sql += ' ORDER BY p.id DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('DB 조회 오류:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// [2] PO 추가 (중복 검사, Extra도 동일하게 사용)
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
      [
        vendor_id,
        po_date || null,
        style_no || '',
        po_no,
        pcs || 0,
        cost_rmb || 0,
        note || '',
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('추가 오류:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// [3] PO 수정 (중복 검사)
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note } = req.body;
  try {
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

// [4] PO 삭제 (Extra 항목 포함)
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
