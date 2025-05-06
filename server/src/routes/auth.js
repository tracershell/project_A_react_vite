const express = require('express');
const router = express.Router();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('../lib/db'); // 예: mysql2 pool 사용

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [[user]] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ message: 'Login successful', user: req.session.user });
});

router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ user: null });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
