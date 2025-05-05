import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <>
      <div className={styles.topBar}>
        2055 E. 51st Street, Vernon, CA 90058&nbsp;&nbsp;&nbsp;&nbsp;| <a href="#">Read More →</a>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.logo}>ARGUS US INC.</div>

        <div className={styles.menu}>
          <a href="/">Home</a>
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
        </div>

        <div className={styles.authButtons}>
          <span className={styles.btnWelcome}>
            Welcome, 👤 <span className={styles.usernameBlue}>User</span>! (admin)
          </span>
          <a href="/logout" className={styles.btnSignin}>Log out</a>
          <a href="/register" className={styles.btnSignin}>Register</a>
        </div>
      </nav>
    </>
  );
};

export default Header;