// 📁 server/routes/admin/account/accountaparpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db'); // MySQL2 Promise Pool

/**
 * AP/AR 데이터 조회 및 apar_preparation 테이블에 bulk INSERT/UPDATE
 * 요청 예: GET /api/admin/account/apar?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
router.get('/', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start, end 날짜가 필요합니다.' });
  }

  // 1) SELECT 쿼리
  const selectSQL = `
    SELECT 
      p.po_no,
      p.po_date,
      IFNULL(d.dp_amount_usd, 0) AS dp_amount_usd,
      d.dp_date,
      IFNULL(b.bp_amount_usd, 0) AS bp_amount_usd,
      b.bp_date,
      ROUND(IFNULL(d.dp_amount_usd, 0) + IFNULL(b.bp_amount_usd, 0), 2) AS po_amount_usd
    FROM import_po_list p
    LEFT JOIN (
      SELECT po_no, MAX(dp_date) AS dp_date, SUM(dp_amount_usd) AS dp_amount_usd
      FROM import_deposit_list
      GROUP BY po_no
    ) d ON p.po_no = d.po_no
    LEFT JOIN (
      SELECT po_no, MAX(bp_date) AS bp_date, SUM(bp_amount_usd) AS bp_amount_usd
      FROM import_balance_list
      GROUP BY po_no
    ) b ON p.po_no = b.po_no
    WHERE DATE(p.po_date) BETWEEN ? AND ?
    ORDER BY p.po_date DESC, p.po_no ASC
  `;

  let conn;
  try {
    const [rows] = await db.query(selectSQL, [start, end]);
    console.log('✅ SELECT rows count:', rows.length, 'start=', start, 'end=', end);

    if (rows.length === 0) {
      console.log('⚠️ 선택된 데이터가 없습니다. INSERT/UPDATE 생략.');
      return res.json(rows);
    }

    // 2) values 배열 준비
    const values = rows.map((r, idx) => {
      // 날짜 형식이 문자열 'YYYY-MM-DD'인지 확인, 아니면 toISOString 처리 등
      const poDate = r.po_date ? r.po_date : null;
      const dpDate = r.dp_date ? r.dp_date : null;
      const bpDate = r.bp_date ? r.bp_date : null;
      // 금액 필드: 숫자인지 확인
      const dpAmt = typeof r.dp_amount_usd === 'number' ? r.dp_amount_usd : Number(r.dp_amount_usd) || 0;
      const bpAmt = typeof r.bp_amount_usd === 'number' ? r.bp_amount_usd : Number(r.bp_amount_usd) || 0;
      const poAmt = typeof r.po_amount_usd === 'number' ? r.po_amount_usd : Number(r.po_amount_usd) || (dpAmt + bpAmt);

      // 디버깅: 첫 번째 몇 개를 찍어서 확인
      if (idx < 3) {
        console.log(`Sample row ${idx}:`, {
          po_no: r.po_no,
          po_date: poDate,
          po_amount_usd: poAmt,
          dp_date: dpDate,
          dp_amount_usd: dpAmt,
          bp_date: bpDate,
          bp_amount_usd: bpAmt
        });
      }

      return [
        r.po_no,
        poDate,
        poAmt,
        dpDate,
        dpAmt,
        bpDate,
        bpAmt
      ];
    });
    console.log('✅ Prepared values count:', values.length);

    // 3) bulk INSERT/UPDATE (트랜잭션)
    const insertSQL = `
      INSERT INTO apar_preparation
        (po_no, po_date, po_amount_usd, dp_date, dp_amount_usd, bp_date, bp_amount_usd)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        po_date = VALUES(po_date),
        po_amount_usd = VALUES(po_amount_usd),
        dp_date = VALUES(dp_date),
        dp_amount_usd = VALUES(dp_amount_usd),
        bp_date = VALUES(bp_date),
        bp_amount_usd = VALUES(bp_amount_usd),
        updated_at = CURRENT_TIMESTAMP
    `;

    // getConnection 및 트랜잭션 시작
    conn = await db.getConnection();
    await conn.beginTransaction();

    // bulk 실행
    console.log('▶️ Executing bulk INSERT/UPDATE...');
    const [result] = await conn.query(insertSQL, [values]);
    console.log('✅ Bulk INSERT/UPDATE 결과:', result.affectedRows, result.warningStatus);

    await conn.commit();
    console.log('✅ 트랜잭션 커밋 완료');
    conn.release();
    conn = null;

    // 4) 클라이언트에 JSON 응답
    res.json(rows);

  } catch (err) {
    console.error('❌ AP/AR 처리 실패:', err.message, err.sqlMessage, err.code);
    if (conn) {
      try {
        await conn.rollback();
        console.log('🔄 트랜잭션 롤백 완료');
      } catch (rbErr) {
        console.error('❌ 롤백 실패:', rbErr.message);
      }
      conn.release();
    }
    res.status(500).json({ error: 'Failed to fetch or update AP/AR data' });
  }
});

module.exports = router;
