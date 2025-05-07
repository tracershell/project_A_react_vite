import React from 'react';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <div className={styles.topBar}>
        2055 E. 51st Street, Vernon, CA 90058&nbsp;&nbsp;&nbsp;&nbsp;| <a href="#">Read More →</a>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.logo}>ARGUS US INC.</div>

        <div className={styles.menu}>
          <Link to="/">Home</Link>

          {user?.role === 'admin' && (
            <Link to="/admin">Admin Page</Link>
          )}

          {user?.role === 'user' && (
            <Link to="/user">User Page</Link>
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
              <Link to="/login" className={styles.btnSignin}>Log in</Link>
              <Link to="/register" className={styles.btnSignin}>Register</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
