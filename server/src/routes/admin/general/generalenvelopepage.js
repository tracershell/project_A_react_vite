// server/routes/admin/general/generalenvelopepage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateEnvelopePDF = require('../../../utils/admin/general/generateEnvelopePDF');

// Sender 목록 조회
router.get('/sender', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM envelope_senderdata ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Sender fetch error:', err);
    res.status(500).json({ error: 'Sender fetch failed' });
  }
});

// Receiver 목록 조회
router.get('/receiver', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM envelope_receiverdata ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Receiver fetch error:', err);
    res.status(500).json({ error: 'Receiver fetch failed' });
  }
});

// PDF 생성 요청 처리
router.post('/pdf', async (req, res) => {
  try {
    const { sender, receivers } = req.body;
    if (!Array.isArray(receivers) || receivers.length === 0) {
      return res.status(400).json({ error: 'At least one receiver must be selected' });
    }
    await generateEnvelopePDF(res, { sender, receivers });
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).send('PDF 생성 중 오류 발생');
  }
});

module.exports = router;
