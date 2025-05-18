// server/routes/admin/import/deposit_temp.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 세션에서 user_id 추출 (로그인 미들웨어에서 세션.user에 id가 저장되어 있다고 가정)
function getUserId(req) {
  // 세션 사용자 정보는 프로젝트 환경에 맞게 조정!
  return req.session.user?.id || req.session.userid || null;
}

// 1. 임시 리스트 조회
router.get('/temp', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  const [rows] = await db.query(
    'SELECT * FROM import_deposit_temp WHERE user_id = ? ORDER BY created_at',
    [user_id]
  );
  res.json(rows);
});

// 2. 임시 추가 (Extra Pay 포함)
router.post('/temp/add', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  const { vendor_id, vendor_name, po_no, style_no, dp_amount_rmb, dp_amount_usd, dp_exrate, dp_date, comment } = req.body;
  await db.query(
    `INSERT INTO import_deposit_temp
      (vendor_id, vendor_name, po_no, style_no, dp_amount_rmb, dp_amount_usd, dp_exrate, dp_date, comment, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [vendor_id, vendor_name, po_no, style_no, dp_amount_rmb, dp_amount_usd, dp_exrate, dp_date, comment, user_id]
  );
  res.json({ success: true });
});

// 3. 임시 삭제
router.delete('/temp/delete/:id', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  const { id } = req.params;
  await db.query(
    'DELETE FROM import_deposit_temp WHERE id = ? AND user_id = ?',
    [id, user_id]
  );
  res.json({ success: true });
});

// 4. Pay(커밋) - 임시 데이터를 실제 테이블로 이동
router.post('/temp/commit', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  const { dp_date, dp_exrate } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [tempRows] = await conn.query('SELECT * FROM import_deposit_temp WHERE user_id = ?', [user_id]);
    for (const row of tempRows) {
      await conn.query(
        `INSERT INTO import_deposit_pay (po_id, vendor_id, dp_date, dp_exrate, dp_amount_rmb, dp_amount_usd, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          row.po_no, // 실제 po_id를 사용할 경우 id로 매핑 필요
          row.vendor_id, dp_date || row.dp_date, dp_exrate || row.dp_exrate,
          row.dp_amount_rmb, row.dp_amount_usd, row.comment
        ]
      );
      // import_po dp_status 업데이트 등 추가 필요시 여기에
    }
    await conn.query('DELETE FROM import_deposit_temp WHERE user_id = ?', [user_id]);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});


// 5. 선택하여 넘어온 임시PO도 저장 (DepositPay에서 사용)
router.post('/batchAdd', async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ error: '로그인 필요' });
    const { rows, vendor_id, vendor_name, deposit_rate } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0)
      return res.json({ success: true });

    console.log('Processing batch add for user:', user_id, 'with rows:', rows.length);

    // 기존 user_id의 임시 rows는 모두 삭제
    await db.query('DELETE FROM import_deposit_temp WHERE user_id = ?', [user_id]);

    // 각각 insert : 
    for (const r of rows) {
      const pcs = Number(r.pcs) || 0;
      const cost_rmb = Number(r.cost_rmb) || 0;
      const dp_rate = Number(r.deposit_rate || deposit_rate) || 0;
      const dp_amount = (pcs * cost_rmb * (dp_rate / 100)).toFixed(2);

      await db.query(`
    INSERT INTO import_deposit_temp
    (vendor_name, deposit_rate, vendor_id, po_date, style_no, po_no, pcs, cost_rmb, t_amount_rmb, note, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        r.vendor_name || vendor_name,
        Number(r.deposit_rate || deposit_rate) || 0,
        r.vendor_id || vendor_id,
        r.po_date || null,
        r.style_no || '',
        r.po_no || '',
        Number(r.pcs) || 0,
        Number(r.cost_rmb) || 0,
        Number(r.t_amount_rmb) || (Number(r.pcs) * Number(r.cost_rmb)),
        r.note || '',
        user_id,
      ]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in batchAdd:', error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
