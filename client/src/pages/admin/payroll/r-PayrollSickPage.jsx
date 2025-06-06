// ✅ client/src/admin/payroll/PayrollSickPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollSickPage.module.css';

const api = axios.create({
  baseURL: '/api/admin/payroll/sick',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('authToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
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
      setEmployees(data);
    } catch (e) {
      console.error('직원 목록 불러오기 실패:', e);
    }
  };

  return (
    <div className={styles.page}>
      <h2>Sick Day Input</h2>

      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
        <label style={{ minWidth: '6rem' }}>Select Name</label>
        <select className={styles.nameSelect} value={selected} onChange={(e) => setSelected(e.target.value)}>
  <option value="">-- Select Employee --</option>
  {Array.isArray(employees) &&
    employees.map(e => (
      <option key={e.eid} value={e.eid}>{e.name}</option>
    ))}
</select>
      </div>
    </div>
  );
};

export default PayrollSickPage;