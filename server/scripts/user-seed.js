const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'Tsrtmd@3300',
    database: 'apple2ne1_db'
  });

  const username = 'tshell';
  const plainPassword = 'ts3300';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    const [rows] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, 'user']
      );
      console.log('✅ user user inserted');
    } else {
      console.log('⚠️ user user already exists — no action taken');
    }
  } catch (err) {
    console.error('❌ Error inserting user user:', err.message);
  } finally {
    await connection.end();
    console.log('✅ Connection closed');
  }
})();
