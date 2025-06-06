import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollTaxPage.module.css';

const api = axios.create({
  baseURL: '/api/admin/payroll/sick', // “sick” 라우터로 연결
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('authToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  else console.warn('⚠️ authToken 없음 (SickPage)'); 
  return cfg;
});

const PayrollSickPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      console.log('SickPage API 응답:', data);
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.warn('SickPage: 배열이 아닌 응답 →', data);
        setEmployees([]);
      }
    } catch (e) {
      console.error('SickPage 직원 불러오기 실패:', e);
      setEmployees([]);
    }
  };

  return (
    <div className={styles.page}>
      <h2>Sick Day Input</h2>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
        <label style={{ minWidth: '6rem' }}>Select Name</label>
        <select
          className={styles.nameSelect}
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">-- Select Employee --</option>
          {employees.map(e => (
            <option key={e.eid} value={e.eid}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <h2>Pay Vacation Input</h2>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
        <label style={{ minWidth: '6rem' }}>Select Name</label>
        <select
          className={styles.nameSelect}
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">-- Select Employee --</option>
          {employees.map(e => (
            <option key={e.eid} value={e.eid}>{e.name}</option>
          ))}
        </select>
      </div>
      <h2>Initiate Give Sick & Paid Vacation</h2>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
        <label style={{ minWidth: '6rem' }}>Select Name</label>
        <select
          className={styles.nameSelect}
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">-- Select Employee --</option>
          {employees.map(e => (
            <option key={e.eid} value={e.eid}>{e.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PayrollSickPage;
