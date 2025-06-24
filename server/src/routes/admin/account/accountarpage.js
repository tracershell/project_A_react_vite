// ✅ accountarpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateArReportPDF = require('../../../utils/admin/account/generateArReportPDF');

// GET /list by year
router.get('/', async (req, res) => {
  const year = parseInt(req.query.year);
  if (!year) return res.status(400).json({ error: '연도를 입력해주세요.' });

  try {
    const [rows] = await db.query(
      `SELECT id, ar_date, hq_sales, sr_sales, ar_report 
       FROM ar_data 
       WHERE YEAR(ar_date) = ? 
       ORDER BY ar_date`,
      [year]
    );
    res.json(rows);
  } catch (err) {
    console.error('AR 데이터 조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// POST /add
router.post('/add', async (req, res) => {
  const { ar_date, hq_sales, sr_sales, ar_report } = req.body;
  try {
    await db.query(
      `INSERT INTO ar_data (ar_date, hq_sales, sr_sales, ar_report)
       VALUES (?, ?, ?, ?)`,
      [ar_date, hq_sales, sr_sales, ar_report]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('AR 입력 오류:', err);
    res.status(500).json({ error: '입력 실패' });
  }
});

// PUT /edit/:id
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { ar_date, hq_sales, sr_sales, ar_report } = req.body;
  try {
    await db.query(
      `UPDATE ar_data 
       SET ar_date = ?, hq_sales = ?, sr_sales = ?, ar_report = ? 
       WHERE id = ?`,
      [ar_date, hq_sales, sr_sales, ar_report, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('AR 수정 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// DELETE /delete/:id
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM ar_data WHERE id = ?`, [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('AR 삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// GET /pdf
router.get('/pdf', async (req, res) => {
  const year = parseInt(req.query.year);
  if (!year) return res.status(400).json({ error: '연도 파라미터 필요' });

  try {
    const [rows] = await db.query(
      `SELECT ar_date, hq_sales, sr_sales, ar_report 
       FROM ar_data 
       WHERE YEAR(ar_date) = ? 
       ORDER BY ar_date`,
      [year]
    );
    await generateArReportPDF(res, { rows, year });
  } catch (err) {
    console.error('AR PDF 생성 오류:', err);
    res.status(500).json({ error: 'PDF 생성 실패' });
  }
});

module.exports = router;
