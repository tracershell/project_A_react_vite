import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // ✅ AuthContext에서 user 가져오기

const NotFoundPage = () => {
  const location = useLocation();
  const { user } = useAuth();  // ✅ 현재 로그인한 사용자 정보

  // ✅ role 에 따라 이동 경로 결정
  const returnLink = user?.role === 'admin' ? '/admin' :
                     user?.role === 'user' ? '/user' : '/';

  // 서버로 404 로그 보내기
  fetch('/api/log/404', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: location.pathname, timestamp: new Date() }),
  }).catch(() => { });

  return (
    <div style={{
      textAlign: 'center',
      marginTop: '100px',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ fontSize: '5rem' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>🚧 Page Not Found</h2>
      <p style={{ marginBottom: '30px' }}>
        죄송합니다! <code>{location.pathname}</code> 페이지를 찾을 수 없습니다.
      </p>
      <Link to={returnLink} style={{
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '5px',
        textDecoration: 'none',
      }}>
        {user ? '내 페이지로 돌아가기' : '홈으로 돌아가기'}
      </Link>
    </div>
  );
};

export default NotFoundPage;
