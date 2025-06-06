const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// (파일 상단에 cleanDate 함수가 필요 없다면 생략)

router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, name, jcode, jtitle, workl
       FROM employees
       WHERE status='active'
       ORDER BY name ASC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('SickPage 직원 목록 조회 에러:', err);
    return res.status(500).json({ error: '직원 목록 조회 실패' });
  }
});

module.exports = router;
