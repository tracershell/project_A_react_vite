import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmployeesPrintPage = () => {
  const { eid } = useParams();
  const navigate = useNavigate(); // ✅ 추가
  const [employee, setEmployee] = useState(null);

  console.log('🟡 EmployeesPrintPage mounted');
  console.log('eid from route:', eid);

  useEffect(() => {
    console.log('API 요청 시작:', `/api/admin/employees/employeeslistpage/print/${eid}`);
    axios.get(`/api/admin/employees/employeeslistpage/print/${eid}`, { withCredentials: true })
      .then(res => {
        console.log('✅ 응답 데이터:', res.data);
        setEmployee(res.data);
      })
      .catch(err => {
        console.error('❌ API 실패:', err);
        alert('데이터 로드 실패');
      });
  }, [eid]);

  if (!employee) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>직원 정보 출력</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <tbody>
          <tr><th>EID</th><td>{employee.eid}</td></tr>
          <tr><th>Name</th><td>{employee.name}</td></tr>
          <tr><th>Status</th><td>{employee.status}</td></tr>
          <tr><th>Email</th><td>{employee.email}</td></tr>
          <tr><th>Phone</th><td>{employee.phone}</td></tr>
        </tbody>
      </table>

      {/* ✅ 위치 적절: 표 아래, 내용이 끝난 후 자연스럽게 */}
      <button onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
        ← 뒤로
      </button>
    </div>
  );
};

export default EmployeesPrintPage;
