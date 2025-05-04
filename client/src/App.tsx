import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    fetch('/api/hello') // Vite proxy를 통해 Express API로 전달됨
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('API 요청 실패'));
  }, []);

  return (
    <div style={{ fontFamily: 'Arial', padding: '2rem', fontSize: '20px' }}>
      <h1>🍎 APPLE2NE1 프론트엔드</h1>
      <p>백엔드 메시지: <strong>{message}</strong></p>
    </div>
  );
};

export default App;
