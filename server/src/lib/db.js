const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ 여기서 pool 선언 후에 테스트 실행해야 함
pool.query('SELECT 1')
  .then(() => console.log(`✅ MySQL connected to ${process.env.DB_HOST}:${process.env.DB_PORT}`))
  .catch((err) => console.error('❌ MySQL connection error:', err));

module.exports = pool;
