// 📁 client/src/pages/admin/employees/EmployeesPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EmployeesPage.module.css';
import axios from 'axios';

const EmployeesPage = () => {
  const [selectedEid, setSelectedEid] = useState('');
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data } = await axios.get('/api/admin/employees/employeespage');
    setEmployees(data);
  };

  const handleViewIndividual = () => {
    if (!selectedEid) return alert('EID를 입력하세요.');
    navigate(`/admin/employees/employeesprintpage/print/${selectedEid}`);
  };

  const handlePdfIndividual = () => {
    if (!selectedEid) return alert('EID를 입력하세요.');
    window.open(`/api/admin/employees/employeespage/pdf/individual/${selectedEid}`, '_blank');
  };

  const handlePdfAll = () => {
    window.open(`/api/admin/employees/employeeslistpage/pdf?status=active`, '_blank');
  };

  return (
    <div className={styles.page}>
      <h2>Employee List</h2>
      <div className={styles.buttonGroup}>
        <input
          type="text"
          placeholder="EID 입력"
          value={selectedEid}
          onChange={(e) => setSelectedEid(e.target.value)}
        />
        <button onClick={handleViewIndividual} disabled={!selectedEid}>개인 보기</button>
        <button onClick={handlePdfIndividual} disabled={!selectedEid}>개인 PDF 보기</button>
        <button onClick={handlePdfAll}>전체 PDF 보기</button>
        <button onClick={() => navigate('/admin/employees/employees')}>Input Profile</button>
        <button onClick={() => navigate('/admin/employees/employeesdata')}>Input Doc</button>
        <button onClick={() => navigate('/admin/employees/employeesphoto')}>Input Photo</button>
      </div>

      <div className={styles.bottomSection} style={{ overflowX: 'hidden' }}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              {[ 'ID', 'Status', 'EID', 'Name', 'SS No', 'Birthday', 'Email', 'Phone', 'Job Code',
                 'Job Title', 'Start', 'End', 'Sick', 'Vac', 'Work', 'Address', 'City', 'State', 'Zip', 'Remark']
                .map(header => (
                  <th key={header}>{header}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? employees.map(emp => (
              <tr
                key={emp.id}
                className={emp.eid === selectedEid ? styles.selectedRow : ''}
                onClick={() => setSelectedEid(emp.eid)}
              >
                <td>{emp.id}</td>
                <td>{emp.status}</td>
                <td>{emp.eid}</td>
                <td>{emp.name}</td>
                <td>{emp.ss}</td>
                <td>{emp.birth?.split('T')[0]}</td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>{emp.jcode}</td>
                <td>{emp.jtitle}</td>
                <td>{emp.sdate?.split('T')[0]}</td>
                <td>{emp.edate?.split('T')[0]}</td>
                <td>{emp.sick}</td>
                <td>{emp.vac}</td>
                <td>{emp.workl}</td>
                <td>{emp.address}</td>
                <td>{emp.city}</td>
                <td>{emp.state}</td>
                <td>{emp.zip}</td>
                <td>{emp.remark}</td>
              </tr>
            )) : (
              <tr><td colSpan="20">직원 정보가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesPage;
