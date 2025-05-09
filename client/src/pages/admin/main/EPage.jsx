// src/pages/admin/main/EPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const EPage = () => {
  const navigate = useNavigate();

  const handleNextPage = () => {
    navigate('/admin/main/e/e01');
  };

  return (
    <div>
      <h2>Page E</h2>
      <p>This is the E page (e 메뉴 클릭 시 보이는 화면)</p>
      <button onClick={handleNextPage}>다음 페이지 이동</button>
    </div>
  );
};

export default EPage;
