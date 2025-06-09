const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 직원 목록
router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, name FROM employees WHERE status='active' ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('직원 목록 에러:', err);
    res.status(500).json({ error: '직원 목록 조회 실패' });
  }
});

// 리스트 조회
router.get('/list', async (req, res) => {
  const { eid } = req.query;
  if (!eid) return res.status(400).json({ error: 'eid 누락' });

  try {
    const [rows] = await db.query(
      `SELECT id, eid, name, pvdate, pvhour, remark
       FROM sickpv_data
       WHERE eid = ?
       ORDER BY pvdate DESC`, [eid]
    );
    res.json(rows);
  } catch (err) {
    console.error('조회 에러:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// 입력
router.post('/add', async (req, res) => {
  const { eid, name, pvdate, pvhour, remark } = req.body;
  if (!eid || !pvdate || !pvhour) return res.status(400).json({ error: '필수 항목 누락' });

  try {
    await db.query(
      `INSERT INTO sickpv_data (eid, name, pvdate, pvhour, remark)
       VALUES (?, ?, ?, ?, ?)`,
      [eid, name, pvdate, pvhour, remark]
    );
    res.json({ message: '저장 완료' });
  } catch (err) {
    console.error('입력 오류:', err);
    res.status(500).json({ error: '저장 실패' });
  }
});

// 수정
router.post('/update', async (req, res) => {
  const { id, pvdate, pvhour, remark } = req.body;
  if (!id || !pvdate || !pvhour) return res.status(400).json({ error: '필수 항목 누락' });

  try {
    await db.query(
      `UPDATE sickpv_data SET pvdate = ?, pvhour = ?, remark = ? WHERE id = ?`,
      [pvdate, pvhour, remark, id]
    );
    res.json({ message: '수정 완료' });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// 삭제
router.post('/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID 누락' });

  try {
    await db.query(`DELETE FROM sickpv_data WHERE id = ?`, [id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
