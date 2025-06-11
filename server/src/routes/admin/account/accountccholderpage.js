// 📁 server/src/routes/admin/account/accountccholderpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// ✅ 전체 목록 조회
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM creditcard_holder ORDER BY provider ASC`);
    res.json(rows);
  } catch (err) {
    console.error('creditcard_holder 조회 에러:', err);
    res.status(500).json({ error: '목록 조회 실패' });
  }
});

// ✅ 신규 입력
router.post('/add', async (req, res) => {
  const { provider, anumber, holder, hnumber, hlimit, hnote } = req.body;
  if (!provider || !anumber || !holder) {
    return res.status(400).json({ error: '필수 항목 누락' });
  }

  try {
    await db.query(
      `INSERT INTO creditcard_holder (provider, anumber, holder, hnumber, hlimit, hnote) VALUES (?, ?, ?, ?, ?, ?)`,
      [provider, anumber, holder, hnumber || '', hlimit || 0, hnote || '']
    );
    res.json({ message: '입력 완료' });
  } catch (err) {
    console.error('입력 오류:', err);
    res.status(500).json({ error: '입력 실패' });
  }
});

// ✅ 수정
router.post('/update', async (req, res) => {
  const { id, provider, anumber, holder, hnumber, hlimit, hnote } = req.body;
  if (!id) return res.status(400).json({ error: 'ID 누락' });

  try {
    await db.query(
      `UPDATE creditcard_holder SET provider = ?, anumber = ?, holder = ?, hnumber = ?, hlimit = ?, hnote = ? WHERE id = ?`,
      [provider, anumber, holder, hnumber || '', hlimit || 0, hnote || '', id]
    );
    res.json({ message: '수정 완료' });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// ✅ 삭제
router.post('/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID 누락' });

  try {
    await db.query(`DELETE FROM creditcard_holder WHERE id = ?`, [id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
