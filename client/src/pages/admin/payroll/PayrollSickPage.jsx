// client/src/pages/admin/payroll/PayrollSickPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollSickPage.module.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api/admin/payroll/sick', // “sick” 라우터로 연결
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

const PayrollSickPage = () => {
  const [form, setForm] = useState({ name: '', eid: '' });
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState('');
  const navigate = useNavigate();

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

    const handleSickInput = () => {    
    navigate('/admin/payroll/sickinput');
  };

    const handlePvInput = () => {    
    navigate('/admin/payroll/pvinput');
  };


  const handleGivenInput = () => {    
    navigate('/admin/payroll/giveninput');
  };


const [summaryData, setSummaryData] = useState([]);

useEffect(() => {
  fetchSummaryData(form.eid); // eid 지정 or 전체
}, [form.eid]);

const fetchSummaryData = async (eid = '') => {
  try {
    const { data } = await api.get('/summary', { params: { eid } });
    setSummaryData(data || []);
  } catch (err) {
    console.error('요약 데이터 불러오기 실패:', err);
    setSummaryData([]);
  }
};

const handleSickPDF = async () => {
  try {
    const res = await api.post('/pdf/sick', { summaryData }, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    console.error('Sick PDF 보기 실패:', err);
    alert('Sick PDF 생성 실패');
  }
};

const handlePvPDF = async () => {
  try {
    const res = await api.post('/pdf/pv', { summaryData }, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    console.error('PV PDF 보기 실패:', err);
    alert('PV PDF 생성 실패');
  }
};


  return (
    <div className={styles.page}>
      <h2>Sick & Pay Vacation Data</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
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

      {/* 오른쪽: 버튼 전용 박스 */}
  <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
    <button className={styles.lightBlue} onClick={handleSickInput}>Sick Input</button>
    <button className={styles.lightBlue} onClick={handlePvInput}>P. Vacation Input</button>
    <button className={styles.lightBlue} onClick={handleGivenInput}>Sick & PV Given Input</button>
    <button className={styles.submitBtn} onClick={handleSickPDF}>Sick PDF 보기</button>
    <button className={styles.submitBtn} onClick={handlePvPDF}>PV PDF 보기</button>

  </div>
</div>
<div className={styles.tableWrapper}>
  <table className={styles.payTable}>
    <thead>
      <tr>
        <th rowSpan="2">EID</th>
        <th rowSpan="2" className={styles.nameCol}>NAME</th>
        <th colSpan="2">GIVEN</th>
        <th colSpan="2">REMAIN</th>
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
          <th key={month} colSpan="2">{month.toUpperCase()}</th>
        ))}
      </tr>
      <tr>
        <th>Sick</th><th>PV</th>
        <th>Sick</th><th>PV</th>
        {Array.from({ length: 12 }).map((_, idx) => (
          <>
            <th key={`sick-${idx}`} className={styles.sickCol}>S</th>
            <th key={`pv-${idx}`} className={styles.pvCol}>PV</th>
          </>
        ))}
      </tr>
    </thead>
    <tbody>
      {summaryData.map((row, idx) => (
        <tr key={idx}>
          <td>{row.EID}</td>
          <td className={styles.nameCol}>{row.NAME}</td>
          <td>{row.SickGiven}</td>
          <td>{row.PVGiven}</td>
          <td>{row.SickRemain}</td>
          <td>{row.PVRemain}</td>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
            <>
              <td key={`sick-${month}`} className={styles.sickCol}>
                {row[`${month}_S`] || 0}
              </td>
              <td key={`pv-${month}`} className={styles.pvCol}>
                {row[`${month}_PV`] || 0}
              </td>
            </>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default PayrollSickPage;
