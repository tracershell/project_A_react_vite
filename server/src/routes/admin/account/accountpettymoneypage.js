// 📁 server/routes/admin/account/accountpettymoneypage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 전체 조회
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM petty_ledger ORDER BY pldate, id');
    res.json(rows);
  } catch (err) {
    console.error('조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// 입력
router.post('/add', async (req, res) => {
const plcredit = parseFloat(req.body.plcredit) || 0;
const pldebit = parseFloat(req.body.pldebit) || 0;
const pldate = req.body.pldate;
const plcomment = req.body.plcomment || '';

  try {
    await db.query(
      'INSERT INTO petty_ledger (pldate, plcredit, pldebit, plcomment) VALUES (?, ?, ?, ?)',
      [pldate, plcredit, pldebit, plcomment]
    );
    await recalculateBalances();
    res.sendStatus(200);
  } catch (err) {
    console.error('입력 오류:', err);
    res.status(500).json({ error: '입력 실패' });
  }
});

// 수정
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { pldate, plcredit = 0, pldebit = 0, plcomment = '' } = req.body;
  try {
    await db.query(
      'UPDATE petty_ledger SET pldate = ?, plcredit = ?, pldebit = ?, plcomment = ? WHERE id = ?',
      [pldate, plcredit, pldebit, plcomment, id]
    );
    await recalculateBalances();
    res.sendStatus(200);
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// 삭제
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM petty_ledger WHERE id = ?', [id]);
    await recalculateBalances();
    res.sendStatus(200);
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 💡 Balance 재계산 함수 (pldate + id 순으로 순차 누적)
async function recalculateBalances() {
  const [rows] = await db.query('SELECT * FROM petty_ledger ORDER BY pldate, id');
  let balance = 0;
  for (const row of rows) {
    balance += parseFloat(row.plcredit || 0);
    balance -= parseFloat(row.pldebit || 0);
    await db.query('UPDATE petty_ledger SET plbalance = ? WHERE id = ?', [balance, row.id]);
  }
}

module.exports = router;
