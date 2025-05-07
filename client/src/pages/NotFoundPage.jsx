import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFoundPage = () => {
  const location = useLocation();

  // 서버로 404 로그 보내기 (예: /api/log/404)
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
      <Link to="/" style={{
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '5px',
        textDecoration: 'none',
      }}>
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;
