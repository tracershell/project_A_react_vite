// src/pages/LoginPage.jsx
import React from 'react';
import styles from './LoginPage.module.css'; // ✅ 모듈 방식으로 불러오기

const LoginPage = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔐 로그인 페이지</h2>
    </div>
  );
};

export default LoginPage;
