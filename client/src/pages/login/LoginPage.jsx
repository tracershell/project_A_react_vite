import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { login } = useAuth();  // ✅ login만 사용
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로그인 후 user 정보 받음
    const loggedInUser = await login(username, password);

    if (loggedInUser) {
      // ✅ role에 따라 분기 이동
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'user') {
        navigate('/user');
      } else {
        navigate('/');
      }
    } else {
      setError('Invalid credentials'); // 로그인 실패 처리
    }
  };

  return (
    <div className={styles.container_login}>
      <div className={styles.loginBox}>
        <img src="/logo_origami.png" alt="Docker Logo" className={styles.logo} />
        <h2>Log in</h2>
        <p className={styles.loginDescription}>
          If you haven't registered yet, you'll need to register first.
        </p>

        {error && <div className={styles.loginError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="User name"
            required
            className={styles.inputField}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={styles.inputField}
          />
          <button type="submit" className={styles.btnPrimary}>
            Continue
          </button>
        </form>

        <div className={styles.loginDivider}>OR</div>

        <div className={styles.socialLogin}>
          <button className={styles.btnSocial}>
            <a href="/">Never mind !</a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
