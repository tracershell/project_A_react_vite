// 📁 server/routes/admin/account/accountpettymoneysubmitpage.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateAccountPettyMoneyPDF = require('../../../utils/admin/account/generateAccountPettyMoneySubmitPDF');

// ✅ Submit PDF 생성 라우터 (GET 방식)
router.get('/submitpdf', async (req, res) => {
  const {
    start, end,
    text1, text2, text3, text4,
    iamount01, iamount02, iamount03, iamount04
  } = req.query; // ✅ GET 요청은 query로 받아야 함

  if (!start || !end) {
    return res.status(400).json({ error: '기간(start, end)이 필요합니다.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM petty_ledger WHERE pldate BETWEEN ? AND ? ORDER BY pldate, id',
      [start, end]
    );

    const items = [
      { label: text1 || '', amount: parseFloat(iamount01 || 0) },
      { label: text2 || '', amount: parseFloat(iamount02 || 0) },
      { label: text3 || '', amount: parseFloat(iamount03 || 0) },
      { label: text4 || '', amount: parseFloat(iamount04 || 0) },
    ];

    generateAccountPettyMoneyPDF(res, { rows, start, end, items });
  } catch (err) {
    console.error('Submit PDF 생성 오류:', err);
    res.status(500).json({ error: 'Submit PDF 생성 실패' });
  }
});

module.exports = router;
