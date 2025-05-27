// server/routes/admin/import/balance_temp.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 숫자 문자열 → Number 타입으로 변환
const cleanNumber = (val) => typeof val === 'string' ? Number(val.replace(/,/g, '')) : Number(val);

// 1) 임시 리스트 조회 (bp_status = '')
router.get('/temp', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *,
         DATE_FORMAT(po_date, '%Y-%m-%d') AS po_date,
         DATE_FORMAT(bp_date, '%Y-%m-%d') AS bp_date
       FROM import_balance_list
      WHERE bp_status = ''
      ORDER BY created_at` // 추가: bp_status = '' 조건
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /temp 조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// 2) 임시 추가 (Extra Pay 포함)
router.post('/temp/add', async (req, res) => {
  const {
    vendor_id, vendor_name, deposit_rate,
    po_no, style_no, po_date, pcs, cost_rmb,
    dp_amount_rmb = 0,      // 신규로 받고 싶으면 req.body 에서 받아도 됩니다
    bp_amount_rmb = 0,
    bp_date = null,
    bp_exrate = 0,
    bp_amount_usd = 0,
    note = ''
  } = req.body;

  try {
    await db.query(
      `INSERT INTO import_balance_list
         (vendor_id, vendor_name, deposit_rate,
          po_date, style_no, po_no, pcs, cost_rmb,
          dp_amount_rmb, bp_amount_rmb, bp_date, bp_exrate, bp_amount_usd, bp_status, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendor_id,
        vendor_name,
        cleanNumber(deposit_rate || 0),
        po_date,
        style_no || '',
        po_no,
        cleanNumber(pcs || 0),
        cleanNumber(cost_rmb || 0),
        cleanNumber(dp_amount_rmb),
        cleanNumber(bp_amount_rmb),
        bp_date,
        cleanNumber(bp_exrate),
        cleanNumber(bp_amount_usd),
        '',                // staging 상태는 빈 문자열로
        note
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /temp/add 오류:', err);
    res.status(500).json({ error: '추가 실패' });
  }
});


// 3) 임시 삭제
router.delete('/temp/delete/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM import_balance_list WHERE id = ? AND bp_status = ""', // bp_status='' 조건 추가
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /temp/delete 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 4) 수정된 임시행 업데이트 (환율 적용 등)
router.post('/temp/update', async (req, res) => {
  const { rows } = req.body;
  try {
    for (const r of rows) {
      await db.query(
        `UPDATE import_balance_list
           SET bp_amount_rmb = ?,
               bp_amount_usd = ?,
               bp_exrate     = ?,
               bp_date       = ?,
               note          = ?
         WHERE id = ? AND bp_status = ""`, // bp_status='' 조건
        [
          cleanNumber(r.bp_amount_rmb || 0),
          cleanNumber(r.bp_amount_usd || 0),
          cleanNumber(r.bp_exrate || 0),
          r.bp_date || null,
          r.comment || '',
          r.id
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('POST /temp/update 오류:', err);
    res.status(500).json({ error: '업데이트 실패' });
  }
});

// 5) batchAdd: 화면에서 전달된 rows 로 staging 전체 재구성
router.post('/batchAdd', async (req, res) => {
  const { rows } = req.body;
  try {
    // 1) 기존 staging 삭제
    await db.query('DELETE FROM import_balance_list WHERE bp_status = ""');

    // 2) 새로 insert
    for (const r of rows) {
      await db.query(
        `INSERT INTO import_balance_list
           (po_id, vendor_id, vendor_name, deposit_rate,
            po_date, style_no, po_no, pcs, cost_rmb,
            dp_amount_rmb, bp_amount_rmb, bp_date, bp_exrate, bp_amount_usd, bp_status, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.po_id || null,
          r.vendor_id,
          r.vendor_name,
          cleanNumber(r.deposit_rate || 0),
          r.po_date,
          r.style_no,
          r.po_no,
          cleanNumber(r.pcs || 0),
          cleanNumber(r.cost_rmb || 0),
          cleanNumber(r.dp_amount_rmb || 0),
          cleanNumber(r.bp_amount_rmb || 0),
          r.bp_date || null,
          cleanNumber(r.bp_exrate || 0),
          cleanNumber(r.bp_amount_usd || 0),
          '',                // staging 상태
          r.comment || ''
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('POST /batchAdd 오류:', err);
    res.status(500).json({ error: err.message });
  }
});


// 6) 페이지 언마운트 시 전체 임시행 삭제
router.delete('/temp/clear', async (req, res) => {
  try {
    await db.query('DELETE FROM import_balance_list WHERE bp_status = ""');
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /temp/clear 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 7) Extra Pay용 PO 추가
// 7) Extra Pay용 PO 추가
router.post('/po/add', async (req, res) => {
  const {
    vendor_id, vendor_name, deposit_rate,
    po_no, style_no, po_date, pcs, cost_rmb, note = ''
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) import_po_list 에도 insert
    const [result] = await conn.query(
      `INSERT INTO import_po_list
         (vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        vendor_id,
        po_date,
        style_no,
        po_no,
        cleanNumber(pcs || 0),
        cleanNumber(cost_rmb || 0),
        note
      ]
    );
    const po_id = result.insertId;

    // 2) staging(import_balance_list)에도 insert
    await conn.query(
      `INSERT INTO import_balance_list
         (po_id, vendor_id, vendor_name, deposit_rate,
          po_date, style_no, po_no, pcs, cost_rmb,
          dp_amount_rmb, bp_amount_rmb, bp_date, bp_exrate, bp_amount_usd, bp_status, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        po_id,
        vendor_id,
        vendor_name,
        cleanNumber(deposit_rate || 0),
        po_date,
        style_no,
        po_no,
        cleanNumber(pcs || 0),
        cleanNumber(cost_rmb || 0),
        0,          // dp_amount_rmb 기본 0
        0,          // bp_amount_rmb 기본 0
        null,       // bp_date
        0,          // bp_exrate
        0,          // bp_amount_usd
        '',         // staging 상태
        note
      ]
    );

    await conn.commit();
    res.json({ success: true, insertId: po_id });
  } catch (err) {
    await conn.rollback();
    console.error('POST /po/add 오류:', err);
    res.status(500).json({ error: 'PO 추가 실패' });
  } finally {
    conn.release();
  }
});

// 8) Extra Pay용 PO 삭제
router.delete('/po/delete/:po_no', async (req, res) => {
  const { po_no } = req.params;
  try {
    // staging 삭제
    await db.query(
      'DELETE FROM import_balance_list WHERE po_no = ? AND bp_status = ""',
      [po_no]
    );
    // master 삭제
    await db.query(
      'DELETE FROM import_po_list WHERE po_no = ?',
      [po_no]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /po/delete 오류:', err);
    res.status(500).json({ error: 'PO 삭제 실패' });
  }
});

// 9) 확정 데이터 조회 (bp_status = 'paid')
router.get('/final', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *,
         DATE_FORMAT(po_date, '%Y-%m-%d') AS po_date,
         DATE_FORMAT(bp_date, '%Y-%m-%d') AS bp_date
       FROM import_balance_list
      WHERE bp_status = 'paid'
      ORDER BY bp_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /final 조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

module.exports = router;
