// src/pages/admin/main/epage/EPage-01.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const EPage01 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/admin/main/e');
  };

  return (
    <div>
      <h2>EPage-01</h2>
      <p>여기는 EPage-01 화면입니다.</p>
      <button onClick={handleGoBack}>되돌아 가기</button>
    </div>
  );
};

export default EPage01;
