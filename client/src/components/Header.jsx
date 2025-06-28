import React from 'react';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
// import AdminMenu
import AdminMenu from './adminmenu/AdminMenu';
import MainMenu from './adminmenu/MainMenu';
import AccountMenu from './adminmenu/AccountMenu';
import GeneralMenu from './adminmenu/GeneralMenu';
import ImportMenu from './adminmenu/ImportMenu';
import DomesticMenu from './adminmenu/DomesticMenu';
import MailMenu from './adminmenu/MailMenu';
import EmployeesMenu from './adminmenu/EmployeesMenu';
import PayrollMenu from './adminmenu/PayrollMenu';
import PersonalMenu from './adminmenu/PersonalMenu';
// import UserMenu
import UserMenu from './usermenu/UserMenu';
// import FamilyMenu
import AlexisMenu from './familymenu/AlexisMenu';
// import PersonalMenu
import StudyMenu from './personalmenu/StudyMenu';

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
          {/* ✅ 로그인 안 했을 때만 Home 표시 */}
          {!user && <Link to="/">Home</Link>}
          {user?.role === 'admin' && (
            <>
              <AdminMenu />
              <MainMenu />
              <AccountMenu />
              <GeneralMenu />
              <ImportMenu />
              <DomesticMenu />
              <MailMenu />
              <EmployeesMenu />
              <PayrollMenu />
              <PersonalMenu />
            </>
          )}
          {user?.role === 'user' && <UserMenu />}
          {user?.role === 'family' && <AlexisMenu />}
          {user?.role === 'personal' && <StudyMenu />}
        </div>

        <div className={styles.authButtons}>
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