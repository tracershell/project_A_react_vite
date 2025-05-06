import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

// 예시 사용자 (실제로는 Context나 Redux 등에서 받아옴)
const mockUser = {
  username: 'tshell',
  role: 'admin', // 또는 'user'
};

const Layout = ({ children, message }) => {
  return (
    <div className={styles.layoutContainer}>
      {/* 사용자 정보 전달 */}
      <Header user={mockUser} />

      <main className={styles.layoutMain}>
        {/* ✅ 중앙 정렬 테스트 박스 */}
        <div style={{ border: '1px solid red', width: '600px', margin: '0 auto', textAlign: 'center' }}>
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
