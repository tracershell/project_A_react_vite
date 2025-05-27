const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateBalancePDF = require('../../../utils/generateBalancePDF');

// Balance Pay 전체 조회 (vendor_id, bp_date 조건 검색 가능)
router.get('/', async (req, res) => {
  const { vendor_id, bp_date } = req.query;
  let sql = `
    SELECT b.*, p.po_no, p.style_no, v.name AS vendor_name
      FROM import_balance_list b
      JOIN import_po_list    p ON b.po_id      = p.id
      JOIN import_vendors    v ON b.vendor_id  = v.id
     WHERE 1=1
  `;
  const params = [];
  if (vendor_id) {
    sql += ' AND b.vendor_id = ?';
    params.push(vendor_id);
  }
  if (bp_date) {
    sql += ' AND b.bp_date = ?';
    params.push(bp_date);
  }
  sql += ' ORDER BY b.bp_date DESC, b.id DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Balance 조회 오류:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Balance Pay 추가/저장 (단일 row)
router.post('/add', async (req, res) => {
  const { po_id, vendor_id, bp_date, bp_exrate, bp_amount_rmb, bp_amount_usd, comment } = req.body;
  try {
    await db.query(
      `INSERT INTO import_balance_list
         (po_id, vendor_id, bp_date, bp_exrate, bp_amount_rmb, bp_amount_usd, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         bp_date        = VALUES(bp_date),
         bp_exrate      = VALUES(bp_exrate),
         bp_amount_rmb  = VALUES(bp_amount_rmb),
         bp_amount_usd  = VALUES(bp_amount_usd),
         comment        = VALUES(comment)`,
      [po_id, vendor_id, bp_date, bp_exrate, bp_amount_rmb, bp_amount_usd, comment]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Balance 추가 오류:', err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// PDF: 커밋된 날짜별 Balance Pay 만
router.get('/pdf', async (req, res) => {
  try {
    const { date, exrate } = req.query;
    const [rows] = await db.query(
      `SELECT b.*, p.po_no, p.style_no, v.name AS vendor_name
         FROM import_balance_list b
         JOIN import_po_list    p ON b.po_id     = p.id
         JOIN import_vendors    v ON b.vendor_id = v.id
        WHERE b.bp_date = ?`,
      [date]
    );
    await generateBalancePDF(res, rows, { date, exrate });
  } catch (err) {
    console.error('PDF 생성 오류(GET):', err);
    res.status(500).send('PDF 생성 오류');
  }
});

// PDF: 현재 화면 상태 전체
router.post('/pdf', async (req, res) => {
  try {
    const { records, date, exrate } = req.body;
    await generateBalancePDF(res, records, { date, exrate });
  } catch (err) {
    console.error('PDF 생성 오류(POST):', err);
    res.status(500).send('PDF 생성 오류');
  }
});

// bp_date 목록만 뽑아서 셀렉트박스용으로
router.get('/dates', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT DATE_FORMAT(bp_date, '%Y-%m-%d') AS bp_date
         FROM import_balance_list
        ORDER BY bp_date DESC`
    );
    res.json(rows.map(r => r.bp_date));
  } catch (err) {
    console.error('bp_date 목록 불러오기 실패:', err);
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

module.exports = router;
