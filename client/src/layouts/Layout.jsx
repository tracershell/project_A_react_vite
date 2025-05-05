import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const Layout = ({ children, message }) => {
  return (
    <div className={styles.layoutContainer}>
      <Header />

      <main className={styles.layoutMain}>
        {/* ✅ 중앙 정렬 테스트 박스 */}
        <div style={{ border: '1px solid red', width: '600px', textAlign: 'center' }}>
          ✅ 중앙 정렬 테스트 박스
        </div>

        {children || <Outlet />}

        <div className={styles.backendMessage}>
          백엔드 메시지: <strong>{message}</strong>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
