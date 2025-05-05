const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// ✅ MySQL 연결 풀 (dotenv는 app.js에서 한 번만 실행하면 됨)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// ✅ POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 사용자 조회
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND status = "active"',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // 로그인 성공: 마지막 로그인 시간 갱신
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // 응답 데이터 구성 (보안상 비밀번호 제외)
    const { id, name, email, role } = user;

    res.json({
      user: {
        id,
        username,
        name,
        email,
        role,
        redirect: role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
