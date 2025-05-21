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
    res.json(rows);
  } catch (err) {
    console.error('임시 조회 오류:', err);
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
    po_no,
    style_no,
    dp_amount_rmb,
    dp_amount_usd,
    dp_exrate,
    dp_date,
    comment,
  } = req.body;

  try {
    await db.query(
      `INSERT INTO import_temp
     (vendor_name, deposit_rate, vendor_id, po_date,
      style_no, po_no, pcs, cost_rmb,
      dp_amount_rmb, dp_amount_usd, dp_exrate, dp_date,
      note, user_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.vendor_name || vendor_name,
        dp_rate,
        r.vendor_id || vendor_id,
        r.po_date || null,
        r.style_no || '',
        r.po_no || '',
        pcs,
        cost_rmb,
        dp_rmb,               // 계산된 숫자
        dp_usd,               // 계산된 숫자
        exrate || null,
        req.body.dp_date || null,
        r.note || '',
        user_id,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('임시 추가 오류:', err);
    res.status(500).json({ error: '추가 실패' });
  }
});

// 3. 임시 삭제
router.delete('/temp/delete/:id', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  const { id } = req.params;

  try {
    await db.query(
      'DELETE FROM import_temp WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('임시 삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 4. Pay(커밋) - 임시 데이터를 실제 테이블로 이동
router.post('/temp/commit', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  const { dp_date, dp_exrate } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [tempRows] = await conn.query(
      'SELECT * FROM import_temp WHERE user_id = ?',
      [user_id]
    );

    for (const row of tempRows) {
      let temp_po_id;

      if (!row.po_id) {
        // 🔹 신규 P/O 등록
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
      } else {
        // 🔹 기존 P/O 사용
        temp_po_id = row.po_id;
      }

      // 🔹 입금 이력 저장
      await conn.query(
        `INSERT INTO import_deposit_list (
      po_id, vendor_id, vendor_name, deposit_rate,
      po_date, style_no, po_no, pcs, cost_rmb,
      dp_amount_rmb, dp_date, dp_exrate, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          row.dp_date,
          row.dp_exrate,
          row.note || ''
        ]
      );

      // 🔹 import_temp 삭제
      await conn.query('DELETE FROM import_temp WHERE id = ?', [row.id]);

      // 🔹 PO 입금 상태 업데이트
      await conn.query(
        `UPDATE import_po_list
     SET dp_amount_rmb = dp_amount_rmb + ?,
         dp_status = 'paid'
     WHERE id = ?`,
        [row.dp_amount_rmb, temp_po_id]
      );
    }


    // 4-1) 확정 입금 이력 저장
    await conn.query(
      `INSERT INTO import_deposit_list
           (po_id, vendor_id, dp_date, dp_exrate, dp_amount_rmb, dp_amount_usd, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        poRow.id,
        row.vendor_id,
        dp_date || row.dp_date,
        dp_exrate || row.dp_exrate,
        row.dp_amount_rmb,
        row.dp_amount_usd,
        row.comment,
      ]
    );

    // 4-2) PO 마스터 누적 및 상태 갱신
    await conn.query(
      `UPDATE import_po_list
           SET dp_amount_rmb = dp_amount_rmb + ?,
               dp_status     = 'paid'
         WHERE id = ?`,
      [row.dp_amount_rmb, poRow.id]
    );
  }

    // 4-3) 임시 데이터 삭제
    await conn.query(
    'DELETE FROM import_temp WHERE user_id = ?',
    [user_id]
  );

  await conn.commit();
  res.json({ success: true });
} catch (err) {
  await conn.rollback();
  console.error('커밋 중 오류:', err);
  res.status(500).json({ error: err.message });
} finally {
  conn.release();
}
});

// 5. 선택하여 넘어온 PO 임시저장 (batchAdd)
router.post('/batchAdd', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });

  const { rows, vendor_id, vendor_name, deposit_rate } = req.body;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.json({ success: true });
  }

  try {
    // 5-1) 기존 임시 삭제
    await db.query('DELETE FROM import_temp WHERE user_id = ?', [user_id]);

    // 5-2) 새 임시 추가
    for (const r of rows) {
      if (!r.po_no || !r.vendor_id || !r.vendor_name) {
        throw new Error('필수 필드 누락: po_no, vendor_id, vendor_name');
      }

      const po_date = r.po_date || new Date().toISOString().split('T')[0];
      const style_no = r.style_no || '';
      const po_no = r.po_no || '';
      const pcs = cleanNumber(r.pcs);
      const cost_rmb = cleanNumber(r.cost_rmb);

      // ✅ import_po_list에서 po_id 가져오기
      const [[poRow]] = await db.query('SELECT id FROM import_po_list WHERE po_no = ?', [po_no]);
      const po_id = poRow?.id || null;

      await db.query(
        `INSERT INTO import_temp
     (po_id, vendor_id, vendor_name, deposit_rate, po_date,
      style_no, po_no, pcs, cost_rmb, user_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          po_id,  // ← 새로 추가된 값
          r.vendor_id || vendor_id,
          r.vendor_name || vendor_name,
          cleanNumber(r.deposit_rate || deposit_rate),
          po_date,
          style_no,
          po_no,
          pcs,
          cost_rmb,
          user_id,
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('batchAdd 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. 페이지 이탈 시 전체 임시 데이터 삭제
router.delete('/temp/clear', async (req, res) => {
  const user_id = getUserId(req);
  if (!user_id) return res.status(401).json({ error: '로그인 필요' });
  try {
    await db.query('DELETE FROM import_temp WHERE user_id = ?', [user_id]);
    res.json({ success: true });
  } catch (err) {
    console.error('clear 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
