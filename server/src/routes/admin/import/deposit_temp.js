// server/routes/admin/import/deposit_temp.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 문자열 형 숫자 정리 헬퍼
const cleanNumber = (val) => {
  if (typeof val === 'string') return Number(val.replace(/,/g, ''));
  return Number(val);
};

// 세션에서 user_id 추출 (로그인 미들웨어에서 세션.user에 id가 저장되어 있다고 가정)
function getUserId(req) {
  return req.session.user?.id || req.session.userid || null;
}

// 1. 임시 리스트 조회
router.get('/temp', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM import_temp WHERE user_id = ? ORDER BY created_at',
      [user_id]
    );
    console.debug('[GET /temp] fetched rows count=', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('[GET /temp] 조회 오류:', err.stack || err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// 2. 임시 추가 (Extra Pay 포함)
router.post('/temp/add', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  const {
    vendor_id,
    vendor_name,
    deposit_rate,
    po_no,
    style_no,
    po_date,
    pcs,
    cost_rmb,
    dp_amount_rmb,
    dp_exrate,
    dp_date,
    note
  } = req.body;

  try {
    console.debug('[POST /temp/add] body=', req.body);
    await db.query(
      `INSERT INTO import_temp
        (vendor_id, vendor_name, deposit_rate, po_date,
         style_no, po_no, pcs, cost_rmb,
         dp_amount_rmb, dp_exrate, dp_date, note, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendor_id,
        vendor.name || '',
        cleanNumber(deposit_rate || 0),
        po_date || null,
        style_no || '',
        po_no || '',
        cleanNumber(pcs) || 0,
        cleanNumber(cost_rmb) || 0,
        cleanNumber(dp_amount_rmb) || 0,
        cleanNumber(dp_exrate) || null,
        dp_date || null,
        note || '',
        user_id
      ]
    );
    console.debug('[POST /temp/add] INSERT 완료');
    res.json({ success: true });
  } catch (err) {
    console.error('[POST /temp/add] 추가 오류:', err.stack || err);
    res.status(500).json({ error: '추가 실패' });
  }
});

// 3. 임시 삭제
router.delete('/temp/delete/:id', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  try {
    await db.query(
      'DELETE FROM import_temp WHERE id = ? AND user_id = ?',
      [req.params.id, user_id]
    );
    console.debug('[DELETE /temp/delete] id=', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /temp/delete] 삭제 오류:', err.stack || err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 4. Pay(커밋) - 임시 데이터를 실제 테이블로 이동
router.post('/temp/commit', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  // 클라이언트에서 전달된 Pay Date, Exrate
  const { dp_date: bodyDpDate, dp_exrate: bodyExrate } = req.body;
  console.debug('[POST /temp/commit] Pay Date(body)=', bodyDpDate, 'Exrate(body)=', bodyExrate);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    //     // 📌 vendor_name, deposit_rate 를 vendor_id로 조회
    // const [[vendor]] = await conn.query(
    //   'SELECT name AS vendor_name, deposit_rate FROM import_vendors WHERE id = ?',
    //   [vendor_id]
    // );

    const [tempRows] = await conn.query(
      'SELECT * FROM import_temp WHERE user_id = ?',
      [user_id]
    );
    console.debug('[POST /temp/commit] tempRows count=', tempRows.length);

    for (const row of tempRows) {
      console.debug('[POST /temp/commit] 처리할 row:', row);

      // ① po_id 없으면 새로 생성
      let temp_po_id = row.po_id;
      if (!temp_po_id) {
        const [insertPo] = await conn.query(
          `INSERT INTO import_po_list (
             vendor_id, po_date, style_no, po_no, pcs, cost_rmb
           ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            row.vendor_id,
            row.po_date || new Date(),
            row.style_no || '',
            row.po_no,
            row.pcs || 0,
            row.cost_rmb || 0
          ]
        );
        temp_po_id = insertPo.insertId;
        console.debug(`[POST /temp/commit] 신규 PO 생성, id=${temp_po_id}`);
      }

      // ② dp_date, dp_exrate fallback 로직
      const usedDpDate = bodyDpDate || row.dp_date || new Date().toISOString().split('T')[0];
      const usedDpExrate = bodyExrate || row.dp_exrate || 1;
      console.debug(
        `[POST /temp/commit] using dp_date='${usedDpDate}', dp_exrate=${usedDpExrate}`
      );

      // ③ 입금 이력 저장 : 임시 DB 에서 실제 DB 로 이동 | "import_temp" → "import_deposit_list"
      await conn.query(
        `INSERT INTO import_deposit_list (
     po_id, vendor_id, vendor_name, deposit_rate,
     po_date, style_no, po_no, pcs, cost_rmb,
     dp_amount_rmb, dp_date, dp_exrate, dp_status, note
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          temp_po_id,
          row.vendor_id,
          row.vendor_name || '',
          row.deposit_rate || 0,
          row.po_date,
          row.style_no,
          row.po_no,
          row.pcs || 0,
          row.cost_rmb || 0,
          row.dp_amount_rmb,
          usedDpDate,
          usedDpExrate,
          row.dp_status || 'paid',   // ✅ 추가됨
          row.note || ''
        ]
      );
      console.debug('[POST /temp/commit] import_deposit_list INSERT 완료');

      // ④ PO master 업데이트
      await conn.query(
        `UPDATE import_po_list
           SET dp_amount_rmb = dp_amount_rmb + ?,
               dp_status     = 'paid'
         WHERE id = ?`,
        [row.dp_amount_rmb, temp_po_id]
      );
      console.debug('[POST /temp/commit] import_po_list 업데이트, id=', temp_po_id);

      // ⑤ 임시 데이터 삭제
      await conn.query('DELETE FROM import_temp WHERE id = ?', [row.id]);
      console.debug('[POST /temp/commit] import_temp 삭제, id=', row.id);
    }

    await conn.commit();
    console.debug('[POST /temp/commit] 트랜잭션 커밋 완료');
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error('[POST /temp/commit] 트랜잭션 롤백:', err.stack || err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 5. batchAdd
router.post('/batchAdd', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  const { rows, vendor_id, vendor_name, deposit_rate } = req.body;
  console.debug('[POST /batchAdd] called, user_id=', user_id, 'body.rows=', rows);

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.json({ success: true });
  }

  try {
    // 5-1) 기존 임시 삭제
    await db.query('DELETE FROM import_temp WHERE user_id = ?', [user_id]);
    console.debug('[POST /batchAdd] 기존 import_temp 삭제 완료');

    // 5-2) 새 임시 추가
    for (const r of rows) {
      console.debug('[POST /batchAdd] 처리할 r=', r);
      if (!r.po_no || !r.vendor_id || !r.vendor_name) {
        throw new Error('필수 필드 누락: po_no, vendor_id, vendor_name');
      }

      const po_date = r.po_date || new Date().toISOString().split('T')[0];
      const style_no = r.style_no || '';
      const pcs = cleanNumber(r.pcs) || 0;
      const cost_rmb = cleanNumber(r.cost_rmb) || 0;

      // po_id 조회
      const [[poRow]] = await db.query(
        'SELECT id FROM import_po_list WHERE po_no = ?',
        [r.po_no]
      );
      const po_id = poRow?.id || null;
      if (!poRow) {
        console.warn(
          `[POST /batchAdd] PO No '${r.po_no}' not found → commit 시 신규 생성 예정`
        );
      }

      await db.query(
        `INSERT INTO import_temp
   (po_id, vendor_id, vendor_name, deposit_rate, po_date,
    style_no, po_no, pcs, cost_rmb,
    dp_amount_rmb, dp_amount_usd, dp_exrate, dp_date,
    user_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          po_id,
          r.vendor_id || vendor_id,
          r.vendor_name || vendor_name,
          cleanNumber(r.deposit_rate || deposit_rate),
          po_date,
          style_no,
          r.po_no,
          pcs,
          cost_rmb,
          cleanNumber(r.dp_amount_rmb) || 0,
          cleanNumber(r.dp_amount_usd) || 0,
          cleanNumber(r.dp_exrate) || null,
          r.dp_date || null,
          user_id
        ]
      );

      console.debug('[POST /batchAdd] import_temp INSERT 완료 for po_no=', r.po_no);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[POST /batchAdd] 오류:', err.stack || err);
    res.status(500).json({ error: err.message });
  }
});

// 6. 페이지 이탈 시 전체 임시 데이터 삭제
router.delete('/temp/clear', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  try {
    await db.query('DELETE FROM import_temp WHERE user_id = ?', [user_id]);
    console.debug('[DELETE /temp/clear] import_temp 전체 삭제 for user_id=', user_id);
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /temp/clear] clear 오류:', err.stack || err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// GET /deposit/final - 확정 데이터 조회
router.get('/final', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM import_deposit_list ORDER BY dp_date DESC');
    res.json(rows);
  } catch (err) {
    console.error('[GET /deposit/final] 오류:', err.stack || err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// 7. PO 추가 (Extra Pay PO) 
router.post('/po/add', async (req, res) => {
  const {
    vendor_id,
    vendor_name,
    deposit_rate,
    po_no,
    style_no,
    po_date,
    pcs,
    cost_rmb,
    note,
    dp_amount_rmb,
    dp_exrate,
    dp_date
  } = req.body;

  if (!vendor_id || !po_no) return res.status(400).json({ error: '필수 항목 누락' });

  const user_id = req.session.user?.id || req.session.userid || null;
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. import_po_list 에 저장 (())
    const [result] = await conn.query(
      `INSERT INTO import_po_list 
         (vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, po_date, style_no, po_no, pcs, cost_rmb, note]
    );

    // 1-1. vendor_id 로 vendor_name, deposit_rate 조회

    const [[vendor]] = await conn.query(
      'SELECT name, deposit_rate FROM import_vendors WHERE id = ?',
      [vendor_id]
    );



    // 2. import_temp 에 저장
    await conn.query(
      `INSERT INTO import_temp 
   (po_id, vendor_id, vendor_name, deposit_rate, po_date,
    style_no, po_no, pcs, cost_rmb,
    dp_amount_rmb, dp_exrate, dp_date, note, user_id)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.insertId,
        vendor_id,
        vendor.name || '',         // ✅ vendors field
        vendor.deposit_rate || 0,         // ✅ 수정된 부분
        po_date,
        style_no || '',
        po_no,
        pcs || 0,
        cost_rmb || 0,
        dp_amount_rmb || 0,
        dp_exrate || null,
        dp_date || null,
        note || '',
        user_id
      ]
    );
    await conn.commit();
    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('[POST /po/add] 오류:', err.stack || err);
    res.status(500).json({ error: 'DB 저장 실패' });
  } finally {
    conn.release();
  }
});

// ✅ Extra Pay PO: temp + po_list 동시 삭제
router.delete('/po/delete/:po_no', async (req, res) => {
  const user_id = getUserId(req);
  const { po_no } = req.params;

  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. import_temp 삭제 (user_id 확인)
    await conn.query(
      'DELETE FROM import_temp WHERE po_no = ? AND user_id = ?',
      [po_no, user_id]
    );

    // 2. import_po_list 삭제
    await conn.query(
      'DELETE FROM import_po_list WHERE po_no = ?',
      [po_no]
    );

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error('[DELETE /po/delete/:po_no] 오류:', err.stack || err);
    res.status(500).json({ error: '삭제 실패' });
  } finally {
    conn.release();
  }
});


module.exports = router;