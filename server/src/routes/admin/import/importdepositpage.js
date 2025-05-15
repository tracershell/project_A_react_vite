const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// ✅ Deposit Pay 처리 API
router.post('/pay', async (req, res) => {
  const { records, dp_date, exrate } = req.body;
  if (!records || records.length === 0) return res.status(400).json({ error: '선택된 레코드가 없습니다.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const r of records) {
      const dp_amount_rmb = parseFloat(r.dp_amount_rmb || 0);
      const dp_amount_usd = parseFloat(r.dp_amount_usd || 0);

      // 1️⃣ import_deposit_pay 테이블에 저장
      await conn.query(
        `INSERT INTO import_deposit_pay (po_no, vendor_id, dp_date, dp_amount_rmb, exrate, dp_amount_usd, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [r.po_no, r.vendor_id, dp_date, dp_amount_rmb, exrate, dp_amount_usd, '']
      );

      // 2️⃣ import_po 상태 업데이트
      await conn.query(
        `UPDATE import_po SET dp_status = 'paid', dp_amount = ?, dp_date = ?, dp_exrate = ?, dp_usd = ? WHERE po_no = ?`,
        [dp_amount_rmb, dp_date, exrate, dp_amount_usd, r.po_no]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error('❌ Deposit 저장 실패:', err);
    res.status(500).json({ error: '저장 중 오류 발생' });
  } finally {
    conn.release();
  }
});

module.exports = router;
