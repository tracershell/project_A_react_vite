// client/src/pages/admin/main/FPageView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FPageView = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/admin/main/fpageview/${id}`, { withCredentials: true })
      .then(res => setRecord(res.data))
      .catch(err => {
        console.error(err);
        alert('데이터를 불러오지 못했습니다.');
      });
  }, [id]);

  if (!record) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>레코드 상세 조회 (ID: {id})</h2>
      <p><strong>Date:</strong> {record.date_value}</p>
      <p><strong>Number:</strong> {record.number_value}</p>
      <p><strong>Name:</strong> {record.name_value}</p>
      <button onClick={() => navigate(-1)}>← 뒤로</button>
    </div>
  );
};

export default FPageView;
