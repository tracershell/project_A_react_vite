// server/src/routes/admin/main/fpageview.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// GET /api/admin/main/fpageview/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM cpage WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '해당 레코드가 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('FPageView 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
