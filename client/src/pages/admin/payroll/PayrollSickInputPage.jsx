import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollSickInputPage.module.css';


const api = axios.create({
  baseURL: '/api/admin/payroll/sickinput', // “sick” 라우터로 연결
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('authToken');
  if (t) {
    cfg.headers.Authorization = `Bearer ${t}`;
  } else {
    console.warn('⚠️ authToken 없음 (SickPage)');
  }
  return cfg;
});

const PayrollSickInputPage = () => {
  const [form, setForm] = useState({ name: '', eid: '' });
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

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'name') {
      const emp = employees.find(x => x.name === value) || {};
      setForm(f => ({
        ...f,
        name: value,
        eid: emp.eid || ''
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  return (
    <div className={styles.page}>
      <h2>Sick Day Input</h2>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
        <label style={{ minWidth: '6rem' }}>Select Name</label>
        <select
          name="name"
          value={form.name}
          onChange={handleChange}
          className={styles.nameSelect}
        >
          <option value="">-- Select Employee --</option>
          {employees.map(e => (
            <option key={e.eid} value={e.name}>{e.name}</option>
          ))}
        </select>
      </div>
      
    </div>
  );
};

export default PayrollSickInputPage;
