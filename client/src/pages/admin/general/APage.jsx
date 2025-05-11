import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 추가

const APage = () => {
  const navigate = useNavigate(); // ✅ navigate 훅 사용

  const handleView = () => {
    const url = '/admin/general/anew';
    console.log('🔍 내부 이동 URL:', url);
    navigate(url); // ✅ 같은 탭으로 내부 이동
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>✅ APage: 기존 페이지</h2>
      <p>여기는 General APage입니다.</p>
      <button onClick={handleView} style={{ marginTop: '20px' }}>
        ➕ 새 페이지 보기
      </button>
    </div>
  );
};

export default APage;
