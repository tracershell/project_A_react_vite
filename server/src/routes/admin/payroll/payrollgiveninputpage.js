// ✅ server/src/routes/admin/payroll/payrollgiveninputpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 직원 목록
router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT eid, name FROM employees WHERE status='active' ORDER BY name ASC`);
    res.json(rows);
  } catch (err) {
    console.error('직원 목록 에러:', err);
    res.status(500).json({ error: '직원 목록 조회 실패' });
  }
});

// 전체 목록 조회
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM sickpv_given ORDER BY name ASC`);
    res.json(rows);
  } catch (err) {
    console.error('sickpv_given 조회 에러:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// 신규 입력 (1인 1레코드 제약)
router.post('/add', async (req, res) => {
  const { eid, name, sickgiven, pvgiven, remark } = req.body;
  if (!eid || !name) return res.status(400).json({ error: '필수 항목 누락' });

  try {
    const [check] = await db.query(`SELECT id FROM sickpv_given WHERE eid = ?`, [eid]);
    if (check.length > 0) return res.status(400).json({ error: '이미 등록된 직원입니다.' });

    await db.query(
      `INSERT INTO sickpv_given (eid, name, sickgiven, pvgiven, remark) VALUES (?, ?, ?, ?, ?)`,
      [eid, name, sickgiven || 0, pvgiven || 0, remark || '']
    );
    res.json({ message: '입력 완료' });
  } catch (err) {
    console.error('입력 오류:', err);
    res.status(500).json({ error: '입력 실패' });
  }
});

// 수정
router.post('/update', async (req, res) => {
  const { id, sickgiven, pvgiven, remark } = req.body;
  if (!id) return res.status(400).json({ error: 'ID 누락' });

  try {
    await db.query(
      `UPDATE sickpv_given SET sickgiven = ?, pvgiven = ?, remark = ? WHERE id = ?`,
      [sickgiven || 0, pvgiven || 0, remark || '', id]
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
    await db.query(`DELETE FROM sickpv_given WHERE id = ?`, [id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
