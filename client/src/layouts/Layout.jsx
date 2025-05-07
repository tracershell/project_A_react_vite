import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const Layout = ({ message }) => {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <main className={styles.layoutMain}>
        <Outlet />
        <div className={styles.backendMessage}>
          백엔드 메시지: <strong>{message}</strong>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
