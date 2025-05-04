import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    fetch('/api/hello')   // vite proxy 설정을 통해 /api/hello로 요청
      .then((res) => {
        console.log('👉 응답 상태코드:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('👉 응답 데이터:', data);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error('❌ API 호출 오류:', err);
        setMessage('API 요청 실패');
      });
  }, []);

  return (
    <div style={{ fontFamily: 'Arial', padding: '2rem', fontSize: '20px' }}>
      <h1>🍎 APPLE2NE1 프론트엔드</h1>
      <p>백엔드 메시지: <strong>{message}</strong></p>
    </div>
  );
};

export default App;
