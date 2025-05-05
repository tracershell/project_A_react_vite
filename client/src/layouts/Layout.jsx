import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout = ({ message }) => {
  return (
    <>
      <Header />
      <main style={{ paddingBottom: '50px' }}>
        <Outlet />
        <div style={{ fontFamily: 'Arial', padding: '1rem', fontSize: '14px', color: 'gray' }}>
          백엔드 메시지: <strong>{message}</strong>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Layout;
