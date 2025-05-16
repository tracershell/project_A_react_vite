const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// Balance Pay 전체 조회
router.get('/', async (req, res) => {
  const { vendor_id, bp_date } = req.query;
  let sql = `
    SELECT b.*, p.po_no, p.style_no, v.name AS vendor_name
      FROM import_balance_pay b
      JOIN import_po p ON b.po_id = p.id
      JOIN import_vendors v ON b.vendor_id = v.id
      WHERE 1=1
  `;
  const params = [];
  if (vendor_id) { sql += ' AND b.vendor_id = ?'; params.push(vendor_id); }
  if (bp_date)   { sql += ' AND b.bp_date = ?';   params.push(bp_date); }
  sql += ' ORDER BY b.bp_date DESC, b.id DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('조회 오류:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Balance Pay 추가
router.post('/add', async (req, res) => {
  const { po_id, vendor_id, bp_date, bp_exrate, bp_amount_rmb, bp_amount_usd, comment } = req.body;
  try {
    await db.query(
      `INSERT INTO import_balance_pay (po_id, vendor_id, bp_date, bp_exrate, bp_amount_rmb, bp_amount_usd, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [po_id, vendor_id, bp_date, bp_exrate, bp_amount_rmb, bp_amount_usd, comment]
    );
    // import_po 테이블도 BP Status 등 필요한 필드 업데이트
    await db.query(
      'UPDATE import_po SET bp_status = "paid", bp_amount_rmb = ? WHERE id = ?',
      [bp_amount_rmb, po_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('추가 오류:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

module.exports = router;
