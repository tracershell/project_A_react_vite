const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateBankBalancePDF = require('../../../utils/admin/account/generateBankBalancePDF');

// ✅ GET: 전체 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT row_index, category, item, amount, comment, selected
       FROM bankbalance
       ORDER BY row_index ASC`
    );

    const mapped = Array.from({ length: 20 }, (_, i) => {
      const match = rows.find(r => r.row_index === i + 1);
      return match
        ? {
          category: match.category,
          item: match.item,
          amount: match.amount,
          comment: match.comment,
          checked: match.selected === 1,
        }
        : { category: '', item: '', amount: '', comment: '', checked: false };
    });

    res.json(mapped);
  } catch (err) {
    console.error('🔴 bankbalance 조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// ✅ POST: 저장 (Update 버튼)
router.post('/save', async (req, res) => {
  const { records } = req.body;

  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'records는 배열이어야 합니다.' });
  }

  try {
    // 기존 삭제 후 재삽입 (간단한 구현)
    await db.query('DELETE FROM bankbalance');

    const insertValues = records.map((rec, i) => [
      i + 1,
      rec.category || '',
      rec.item || '',
      parseFloat(rec.amount || 0),
      rec.comment || '',
      rec.checked ? 1 : 0,
    ]);

    if (insertValues.length > 0) {
      await db.query(
        `INSERT INTO bankbalance (row_index, category, item, amount, comment, selected)
         VALUES ?`,
        [insertValues]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('🔴 bankbalance 저장 오류:', err);
    res.status(500).json({ error: '저장 실패' });
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
