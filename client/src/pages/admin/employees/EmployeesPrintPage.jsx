import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EmployeesPrintPage = () => {
  const { eid } = useParams();
  const [employee, setEmployee] = useState(null);

  console.log('🟡 EmployeesPrintPage mounted');
  console.log('eid from route:', eid);  // ← 이것도 안 뜨면 useParams()가 작동 안 한 것

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
    </div>
  );
};

export default EmployeesPrintPage;
