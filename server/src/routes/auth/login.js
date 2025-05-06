const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../lib/db');  // DB 연결 모듈
const session = require('express-session');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [[user]] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // 세션 저장
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
