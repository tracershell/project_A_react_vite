const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/userModel');

// 로그인 처리
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [[user]] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'Invalid user or inactive account' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  res.json({ success: true, user: req.session.user });
});

// 로그아웃
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

module.exports = router;
