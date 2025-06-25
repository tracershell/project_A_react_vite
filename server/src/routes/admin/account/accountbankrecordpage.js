// 📁 server/src/routes/admin/account/accountbankrecordpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateBankRecordPDF = require('../../../utils/admin/account/generateAccountBankRecordPDF');

// 🔍 조회
router.get('/', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: '시작일과 종료일을 입력하세요.' });

  try {
    const [rows] = await db.query(
      `SELECT id, date, rtype, amount, comment FROM bankrecord_data WHERE date BETWEEN ? AND ? ORDER BY date`,
      [start, end]
    );
    res.json(rows);
  } catch (err) {
    console.error('BankRecord 조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// ➕ 입력
router.post('/add', async (req, res) => {
  const { date, rtype, amount, comment } = req.body;
  try {
    await db.query(`INSERT INTO bankrecord_data (date, rtype, amount, comment) VALUES (?, ?, ?, ?)`, [date, rtype, amount, comment]);
    res.sendStatus(200);
  } catch (err) {
    console.error('입력 오류:', err);
    res.status(500).json({ error: '입력 실패' });
  }
});

// ✏️ 수정
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { date, rtype, amount, comment } = req.body;
  try {
    await db.query(
      `UPDATE bankrecord_data SET date = ?, rtype = ?, amount = ?, comment = ? WHERE id = ?`,
      [date, rtype, amount, comment, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// ❌ 삭제
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM bankrecord_data WHERE id = ?`, [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 🧾 PDF
router.get('/pdf', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: '검색 날짜 필요' });

  try {
    const [rows] = await db.query(`SELECT date, rtype, amount, comment FROM bankrecord_data WHERE date BETWEEN ? AND ? ORDER BY date`, [start, end]);
    await generateBankRecordPDF(res, { rows, start, end });
  } catch (err) {
    console.error('PDF 오류:', err);
    res.status(500).json({ error: 'PDF 생성 실패' });
  }
});

module.exports = router;
