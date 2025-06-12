// 📁 server/src/routes/admin/account/accountccpaypage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// ✅ 목록 조회
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM creditcard_data ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    console.error('데이터 조회 오류:', err);
    res.status(500).json({ error: '목록 조회 실패' });
  }
});

// ✅ 입력
router.post('/add', async (req, res) => {
  const {
    pdate, ptype, ptname, pamount,
    provider, anumber, holder, hnumber,
    udate, aitem, icode, inote,
    uamount, uremark
  } = req.body;

  try {
    await db.query(
      `INSERT INTO creditcard_data (
        pdate, ptype, ptname, pamount,
        provider, anumber, holder, hnumber,
        udate, aitem, icode, inote,
        uamount, uremark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pdate, ptype, ptname, pamount,
        provider, anumber, holder, hnumber,
        udate, aitem, icode, inote,
        uamount, uremark
      ]
    );
    res.json({ message: '입력 완료' });
  } catch (err) {
    console.error('입력 오류:', err);
    res.status(500).json({ error: '입력 실패' });
  }
});

// ✅ 수정
router.post('/update', async (req, res) => {
  const {
    id, pdate, ptype, ptname, pamount,
    provider, anumber, holder, hnumber,
    udate, aitem, icode, inote,
    uamount, uremark
  } = req.body;

  if (!id) return res.status(400).json({ error: 'ID 누락' });

  try {
    await db.query(
  `UPDATE creditcard_data SET
    pdate=?, ptype=?, ptname=?, pamount=?,
    provider=?, anumber=?, holder=?, hnumber=?,
    udate=?, aitem=?, icode=?, inote=?,
    uamount=?, uremark=?
   WHERE id = ?`,
  [
    pdate, ptype, ptname, pamount,
    provider, anumber, holder, hnumber,
    udate, aitem, icode, inote,
    uamount, uremark, Number(id)  // ✅ id를 숫자로 변환
  ]
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
    await db.query(`DELETE FROM creditcard_data WHERE id = ?`, [id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// ✅ 카드 소유자 목록 (provider, holder용)
router.get('/holders', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM creditcard_holder ORDER BY holder ASC`);
    res.json(rows);
  } catch (err) {
    console.error('holder 조회 실패:', err);
    res.status(500).json({ error: '소유자 목록 조회 실패' });
  }
});

// ✅ 카드 항목 목록 (aitem용)
router.get('/items', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM creditcard_item ORDER BY aitem ASC`);
    res.json(rows);
  } catch (err) {
    console.error('item 목록 오류:', err);
    res.status(500).json({ error: '항목 목록 조회 실패' });
  }
});

module.exports = router;
