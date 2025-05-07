import React from 'react';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <div className={styles.topBar}>
        2055 E. 51st Street, Vernon, CA 90058&nbsp;&nbsp;&nbsp;&nbsp;| <a href="#">Read More →</a>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.logo}>ARGUS US INC.</div>

        <div className={styles.menu}>
          <Link to="/">Home</Link>

          {/* admin 로그인 후에만 Admin Page 보이기 */}
          {user?.role === 'admin' && (
            <Link to="/admin">Admin Page</Link>
          )}

          {/* user 로그인 후에만 User Page 보이기 */}
          {user?.role === 'user' && (
            <Link to="/user">User Page</Link>
          )}
        </div>

        <div className={styles.authButtons}>
          {/* 로그인 전 → login 만 표시 */}
          {!user ? (
            !isLoginPage && (
              <Link to="/login" className={styles.btnSignin}>Log in</Link>
            )
          ) : (
            <>
              <span className={styles.btnWelcome}>
                Welcome, {user.role === 'admin' ? '👑' : '👤'}{' '}
                <span className={styles.usernameBlue}>{user.username}</span>! ({user.role})
              </span>
              <button onClick={logout} className={styles.btnSignin}>Log out</button>

              {/* admin 에게만 Register 표시 */}
              {user.role === 'admin' && (
                <Link to="/register" className={styles.btnSignin}>Register</Link>
              )}
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
