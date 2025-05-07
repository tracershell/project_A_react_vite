const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../lib/db');  // DB 연결 모듈

router.post('/', async (req, res) => {
  const { username, password, email, name, role, status } = req.body;

  try {
    const [[existingUser]] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, email, name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email, name, role, status]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
