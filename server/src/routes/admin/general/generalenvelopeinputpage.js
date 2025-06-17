

// ✅ server/routes/admin/general/generalenvelopeinputpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// Sender Routes
router.get('/sender', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM envelope_senderdata ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Sender fetch error:', err);
    res.status(500).json({ error: 'Sender fetch failed' });
  }
});

router.post('/sender', async (req, res) => {
  const { sname, sstreet, scity, sstate, szip } = req.body;
  try {
    await db.query(
      'INSERT INTO envelope_senderdata (sname, sstreet, scity, sstate, szip) VALUES (?, ?, ?, ?, ?)',
      [sname, sstreet, scity, sstate, szip]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Sender insert error:', err);
    res.status(500).json({ error: 'Sender insert failed' });
  }
});

router.put('/sender/:id', async (req, res) => {
  const { id } = req.params;
  const { sname, sstreet, scity, sstate, szip } = req.body;
  try {
    await db.query(
      'UPDATE envelope_senderdata SET sname=?, sstreet=?, scity=?, sstate=?, szip=? WHERE id=?',
      [sname, sstreet, scity, sstate, szip, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Sender update error:', err);
    res.status(500).json({ error: 'Sender update failed' });
  }
});

router.delete('/sender/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM envelope_senderdata WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Sender delete error:', err);
    res.status(500).json({ error: 'Sender delete failed' });
  }
});

// Receiver Routes
router.get('/receiver', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM envelope_receiverdata ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Receiver fetch error:', err);
    res.status(500).json({ error: 'Receiver fetch failed' });
  }
});

router.post('/receiver', async (req, res) => {
  const { rcode, rname, ratt, rstreet, rcity, rstate, rzip } = req.body;
  try {
    await db.query(
      'INSERT INTO envelope_receiverdata (rcode, rname, ratt, rstreet, rcity, rstate, rzip) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [rcode, rname, ratt, rstreet, rcity, rstate, rzip]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Receiver insert error:', err);
    res.status(500).json({ error: 'Receiver insert failed' });
  }
});

router.put('/receiver/:id', async (req, res) => {
  const { id } = req.params;
  const { rcode, rname, ratt, rstreet, rcity, rstate, rzip } = req.body;
  try {
    await db.query(
      'UPDATE envelope_receiverdata SET rcode=?, rname=?, ratt=?, rstreet=?, rcity=?, rstate=?, rzip=? WHERE id=?',
      [rcode, rname, ratt, rstreet, rcity, rstate, rzip, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Receiver update error:', err);
    res.status(500).json({ error: 'Receiver update failed' });
  }
});

router.delete('/receiver/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM envelope_receiverdata WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Receiver delete error:', err);
    res.status(500).json({ error: 'Receiver delete failed' });
  }
});

module.exports = router;
