// server/routes/admin/import/deposit_temp.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const cleanNumber = (val) =>
  typeof val === 'string' ? Number(val.replace(/,/g, '')) : Number(val);

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

      const [[poRow]] = await conn.query('SELECT id FROM import_po WHERE po_no = ?', [row.po_no]);
if (!poRow) throw new Error(`PO 번호 '${row.po_no}'에 해당하는 PO를 찾을 수 없습니다.`);

// INSERT 시 기존 poRow.id 사용
await conn.query(
  `INSERT INTO import_deposit_pay (po_id, vendor_id, dp_date, dp_exrate, dp_amount_rmb, dp_amount_usd, comment)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    poRow.id,  // ✅ 중복 없이 poRow 재사용
    row.vendor_id,
    dp_date || row.dp_date,
    dp_exrate || row.dp_exrate,
    row.dp_amount_rmb,
    row.dp_amount_usd,
    row.comment,
  ]
);

if (!poRow) throw new Error(`po_no "${row.po_no}"에 해당하는 PO가 존재하지 않습니다.`);

await conn.query(
  `INSERT INTO import_deposit_pay (po_id, vendor_id, dp_date, dp_exrate, dp_amount_rmb, dp_amount_usd, comment)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    poRow.id, // ✅ 올바르게 매핑된 po_id
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

    // ✅ 쉼표 제거 함수
    const cleanNumber = (val) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      return Number(String(val).replace(/,/g, '')) || 0;
    };

    // 기존 user_id의 임시 rows 삭제
    await db.query('DELETE FROM import_deposit_temp WHERE user_id = ?', [user_id]);

    for (const r of rows) {
      // ✅ 필수 값 누락 체크
      if (!r.po_no || !r.vendor_id || !r.vendor_name) {
        console.log('❌ 누락된 필드:', r);
        throw new Error('필수 필드 누락: po_no, vendor_id, vendor_name');
      }

      const pcs = cleanNumber(r.pcs);
      const cost_rmb = cleanNumber(r.cost_rmb);
      const dp_rate = cleanNumber(r.deposit_rate || deposit_rate);
      const dp_rmb = Number((pcs * cost_rmb * (dp_rate / 100)).toFixed(2));

      // ✅ dp_usd 계산
      let dp_usd = null;
      const rawExrate = req.body.dp_exrate || '';
      const exrate = parseFloat(String(rawExrate).replace(/,/g, ''));
      if (dp_rmb && !isNaN(exrate) && exrate > 0) {
        dp_usd = (dp_rmb / exrate).toFixed(2);
      }

      await db.query(`
        INSERT INTO import_deposit_temp
        (vendor_name, deposit_rate, vendor_id, po_date, style_no, po_no, pcs, cost_rmb, t_amount_rmb,
         dp_amount_rmb, dp_amount_usd, dp_exrate, dp_date, note, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        r.vendor_name || vendor_name,
        dp_rate,
        r.vendor_id || vendor_id,
        r.po_date || null,
        r.style_no || '',
        r.po_no || '',
        pcs,
        cost_rmb,
        cleanNumber(r.t_amount_rmb) || pcs * cost_rmb,
        dp_rmb,
        dp_usd,
        exrate || null,
        req.body.dp_date || null,
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


// 6. 페이지 이탈 시 전체 임시 데이터 삭제
router.delete('/temp/clear', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  await db.query('DELETE FROM import_deposit_temp WHERE user_id = ?', [user_id]);
  res.json({ success: true });
});

module.exports = router;
