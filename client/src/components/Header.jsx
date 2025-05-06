import React from 'react';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';  // ✅ AuthContext 사용

const Header = () => {
  const { user, logout } = useAuth();  // ✅ 전역 사용자 정보 및 로그아웃 함수 가져오기

  return (
    <>
      <div className={styles.topBar}>
        2055 E. 51st Street, Vernon, CA 90058&nbsp;&nbsp;&nbsp;&nbsp;| <a href="#">Read More →</a>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.logo}>ARGUS US INC.</div>

        <div className={styles.menu}>
          <a href="/">Home</a>

          {/* ✅ 관리자 전용 메뉴: role이 'admin'일 때만 표시 */}
          {user?.role === 'admin' && (
            <>
              <div className={styles.dropdown}>
                <a href="#">Account</a>
                <div className={styles.dropdownContent}>
                  <a href="#">Petty Ledger</a>
                  <a href="#">PO</a>
                  <a href="#">Pay</a>
                </div>
              </div>

              <div className={styles.dropdown}>
                <a href="#">General</a>
                <div className={styles.dropdownContent}>
                  <a href="#">Board</a>
                  <a href="#">Schedule</a>
                  <a href="#">doc. manager</a>
                  <a href="#">Monthly Card Charge</a>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.authButtons}>
          {user ? (
            <>
              <span className={styles.btnWelcome}>
                Welcome, {user.role === 'admin' ? '👑' : '👤'}{' '}
                <span className={styles.usernameBlue}>{user.username}</span>! ({user.role})
              </span>
              <button onClick={logout} className={styles.btnSignin}>Log out</button>
            </>
          ) : (
            <>
              <a href="/login" className={styles.btnSignin}>Log in</a>
              <a href="/register" className={styles.btnSignin}>Register</a>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
