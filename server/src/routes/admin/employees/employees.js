const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// 직원 목록 가져오기
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM employees');
  res.json(rows);
});

// 직원 추가
router.post('/add', async (req, res) => {
  const data = req.body;
  await db.query(
    'INSERT INTO employees SET ?',
    data
  );
  res.sendStatus(200);
});

module.exports = router;
