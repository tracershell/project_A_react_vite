// server/routes/admin/import/deposit.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// Deposit Pay 전체 조회 (특정 Vendor, 기간 등 검색)
router.get('/', async (req, res) => {
  const { vendor_id, dp_date } = req.query;
  let sql = `
    SELECT d.*, p.po_no, p.style_no, v.name AS vendor_name
      FROM import_deposit_pay d
      JOIN import_po p ON d.po_id = p.id
      JOIN import_vendors v ON d.vendor_id = v.id
      WHERE 1=1
  `;
  const params = [];
  if (vendor_id) { sql += ' AND d.vendor_id = ?'; params.push(vendor_id); }
  if (dp_date)   { sql += ' AND d.dp_date = ?';   params.push(dp_date); }
  sql += ' ORDER BY d.dp_date DESC, d.id DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('조회 오류:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Deposit Pay 추가/저장
router.post('/add', async (req, res) => {
// 값 도착확인 code
console.log('req.body:', req.body);  // 값 실제로 도착했는지 체크

  const { po_id, vendor_id, dp_date, dp_exrate, dp_amount_rmb, dp_amount_usd, comment } = req.body;
  try {
    // 저장/수정(중복 대비)
    await db.query(
      `INSERT INTO import_deposit_pay
         (po_id, vendor_id, dp_date, dp_exrate, dp_amount_rmb, dp_amount_usd, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         dp_date=VALUES(dp_date), dp_exrate=VALUES(dp_exrate),
         dp_amount_rmb=VALUES(dp_amount_rmb), dp_amount_usd=VALUES(dp_amount_usd), comment=VALUES(comment)
      `,
      [po_id, vendor_id, dp_date, dp_exrate, dp_amount_rmb, dp_amount_usd, comment]
    );
    // import_po 테이블 DP Status 필드 업데이트
    await db.query(
      'UPDATE import_po SET dp_status = "paid", dp_amount_rmb = ? WHERE id = ?',
      [dp_amount_rmb, po_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('추가 오류:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// Deposit Pay PDF 보기 (예시, 실제 PDF 구현 필요)
router.get('/pdf', async (req, res) => {
  res.status(200).send('PDF 다운로드/보기 구현 필요');
});

module.exports = router;
