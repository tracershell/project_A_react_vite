const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateBankBalancePDF = require('../../../utils/admin/account/generateBankBalancePDF');

// ✅ GET: 전체 조회
// 📌 1. 목록 조회 + 최초 20줄 자동 생성
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM bankbalance ORDER BY row_index ASC`);

    // 📌 2. 테이블이 비어있으면 1~20번 기본 생성
    if (rows.length === 0) {
      for (let i = 1; i <= 20; i++) {
        await db.query(`
          INSERT INTO bankbalance (row_index)
          VALUES (?) ON DUPLICATE KEY UPDATE row_index = row_index
        `, [i]);
      }

      // 📌 3. 생성 후 다시 SELECT
      const [newRows] = await db.query(`SELECT * FROM bankbalance ORDER BY row_index ASC`);
      return res.json(newRows);
    }

    // 이미 존재하면 그대로 반환
    res.json(rows);
  } catch (err) {
    console.error('목록 조회 실패:', err);
    res.status(500).json({ error: '목록 조회 실패' });
  }
});

// ✅ POST: 저장 (Update 버튼)


router.post('/save', async (req, res) => {
  const data = req.body; // [{row_index, category, item, amount, comment, selected}]
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const row of data) {
      const { row_index, category, item, amount, comment, selected } = row;
      // 존재하면 UPDATE, 없으면 INSERT
      await conn.query(`
        INSERT INTO bankbalance (row_index, category, item, amount, comment, selected)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          category = VALUES(category),
          item = VALUES(item),
          amount = VALUES(amount),
          comment = VALUES(comment),
          selected = VALUES(selected)
      `, [row_index, category, item, amount, comment, selected]);
    }

    await conn.commit();
    res.sendStatus(200);
  } catch (err) {
    await conn.rollback();
    console.error('저장 실패:', err);
    res.status(500).json({ error: '저장 실패' });
  } finally {
    conn.release();
  }
});


// ✅ POST: PDF 보기 (선택된 항목만)
router.post('/pdf', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT category, item, amount, comment
       FROM bankbalance
       WHERE selected = 1
       ORDER BY row_index ASC`
    );

    await generateBankBalancePDF(res, rows);
  } catch (err) {
    console.error('🔴 PDF 생성 오류:', err);
    res.status(500).json({ error: 'PDF 생성 실패' });
  }
});

module.exports = router;
