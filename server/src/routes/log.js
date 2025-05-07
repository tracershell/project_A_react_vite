const express = require('express');
const router = express.Router();
const db = require('../lib/db');  // MySQL 연결 (pool)

router.post('/404', async (req, res) => {
  const { path, timestamp } = req.body;
  try {
    await db.query('INSERT INTO log_404 (path, timestamp) VALUES (?, ?)', [path, timestamp]);
    res.json({ message: '404 log saved' });
  } catch (err) {
    console.error('❌ Failed to log 404:', err);
    res.status(500).json({ message: 'Error logging 404' });
  }
});

router.get('/404', async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM log_404 ORDER BY timestamp DESC LIMIT 100');
    res.json({ logs });
  } catch (err) {
    console.error('❌ Failed to fetch 404 logs:', err);
    res.status(500).json({ message: 'Error fetching 404 logs' });
  }
});

module.exports = router;
