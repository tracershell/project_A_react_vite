// client/src/pages/admin/payroll/PayrollSickPage.jsx

import React, { useEffect, useState, useMemo } from 'react';
import styles from './PayrollSickPage.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PayrollSickPage = () => {
  const [form, setForm] = useState({ name: '', eid: '' });
  const [employees, setEmployees] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorEmployees, setErrorEmployees] = useState(null);
  const [errorSummary, setErrorSummary] = useState(null);

  const navigate = useNavigate();
  const months = useMemo(() => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setErrorEmployees(null);
    try {
      const { data } = await axios.get('/api/admin/payroll/sick/employees', {
  withCredentials: true
});
      if (Array.isArray(data)) setEmployees(data);
      else setEmployees([]);
    } catch (e) {
      console.error('직원 불러오기 실패:', e);
      setErrorEmployees('직원 목록 로드 중 오류');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'name') {
      const emp = employees.find(x => x.name === value) || {};
      setForm({ name: value, eid: emp.eid || '' });
      if (!value) {
        setSummaryData([]);
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  useEffect(() => {
    fetchSummaryData(form.eid);
  }, [form.eid]);

  const fetchSummaryData = async (eid = '') => {
    setLoadingSummary(true);
    setErrorSummary(null);
    try {
      const params = {};
      if (eid) params.eid = eid;
      const { data } = await axios.get('/api/admin/payroll/sick/summary', {
  params,
  withCredentials: true
});
      if (Array.isArray(data)) setSummaryData(data);
      else setSummaryData([]);
    } catch (err) {
      console.error('요약 불러오기 실패:', err);
      setErrorSummary('요약 데이터 로드 중 오류');
      setSummaryData([]);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSickInput = () => navigate('/admin/payroll/sickinput');
  const handlePvInput = () => navigate('/admin/payroll/pvinput');
  const handleGivenInput = () => navigate('/admin/payroll/giveninput');

  const handleSickPDF = async () => {
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
      return alert('PDF 생성할 Sick 데이터가 없습니다.');
    }
    try {
      const res = await axios.post(
  '/api/admin/payroll/sick/pdf/sick',
  { records: summaryData },
  {
    responseType: 'blob',
    withCredentials: true,
  }
);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Sick PDF 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        alert('유효한 Sick 데이터가 필요합니다.');
      } else {
        alert('Sick PDF 생성 중 오류');
      }
    }
  };

  const handlePvPDF = async () => {
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
      return alert('PDF 생성할 PV 데이터가 없습니다.');
    }
    try {
      const res = await axios.post(
  '/api/admin/payroll/sick/pdf/pv',
  { records: summaryData },
  {
    responseType: 'blob',
    withCredentials: true,
  }
);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('PV PDF 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        alert('유효한 PV 데이터가 필요합니다.');
      } else {
        alert('PV PDF 생성 중 오류');
      }
    }
  };
  useEffect(() => {
  const handleBeforeUnload = () => {
    if (summaryData.length > 0) {
      navigator.sendBeacon(
        '/api/admin/payroll/sick/update-remaining',
        new Blob([JSON.stringify({ records: summaryData })], { type: 'application/json' })
      );
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [summaryData]);

const handleSaveRemaining = async () => {
  if (!Array.isArray(summaryData) || summaryData.length === 0) {
    return alert('저장할 데이터가 없습니다.');
  }
  try {
    await axios.post('/api/admin/payroll/sick/update-remaining', {
      records: summaryData,
    }, { withCredentials: true });

    alert('Sick / PV 잔여 시간이 저장되었습니다.');
  } catch (err) {
    console.error('잔여 저장 실패:', err);
    alert('저장 중 오류 발생');
  }
};



  return (
    <div className={styles.page}>
      <h2>Sick & Pay Vacation Data</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
          <label style={{ minWidth: '6rem' }}>Select Name</label>
          <select name="name" value={form.name} onChange={handleChange} className={styles.nameSelect}>
            <option value="">-- Select Employee --</option>
            {employees.map(e => (
              <option key={e.eid} value={e.name}>{e.name}</option>
            ))}
          </select>
          {loadingEmployees && <span style={{ marginLeft: '0.5rem' }}>로딩 중...</span>}
          {errorEmployees && <div style={{ color: 'red', marginLeft: '0.5rem' }}>{errorEmployees}</div>}
        </div>
        <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem', gap: '0.5rem' }}>
          <button type="button" className={styles.lightBlue} onClick={handleSickInput}>Sick Input</button>
          <button type="button" className={styles.lightBlue} onClick={handlePvInput}>P. Vacation Input</button>
          <button type="button" className={styles.lightBlue} onClick={handleGivenInput}>Sick & PV Given Input</button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSickPDF}
            disabled={!summaryData.length}
            title={summaryData.length ? '' : '먼저 직원 선택 후 데이터를 불러오세요'}
          >
            Sick PDF 보기
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handlePvPDF}
            disabled={!summaryData.length}
            title={summaryData.length ? '' : '먼저 직원 선택 후 데이터를 불러오세요'}
          >
            PV PDF 보기
          </button>
          <button
  type="button"
  className={styles.submitBtn}
  onClick={handleSaveRemaining}
  disabled={!summaryData.length}
  title={summaryData.length ? '' : '먼저 직원 선택 후 데이터를 불러오세요'}
>
  잔여시간 저장
</button>

        </div>
      </div>
      <div className={styles.tableWrapper} style={{ marginTop: '1rem' }}>
        {loadingSummary && <div>요약 데이터 로딩 중...</div>}
        {errorSummary && <div style={{ color: 'red' }}>{errorSummary}</div>}
        {!loadingSummary && !errorSummary && (
          <table className={styles.payTable}>
            <thead>
              <tr>
                <th rowSpan="2">EID</th>
                <th rowSpan="2" className={styles.nameCol}>NAME</th>
                <th colSpan="2">GIVEN</th>
                <th colSpan="2">REMAIN</th>
                {months.map(mon => <th key={mon} colSpan="2">{mon.toUpperCase()}</th>)}
              </tr>
              <tr>
                <th>Sick</th><th>PV</th>
                <th>Sick</th><th>PV</th>
                {months.map((_, idx) => (
                  <React.Fragment key={idx}>
                    <th className={styles.sickCol}>S</th>
                    <th className={styles.pvCol}>PV</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryData.length > 0 ? summaryData.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td>{row.EID}</td>
                  <td className={styles.nameCol}>{row.NAME}</td>
                  <td>{row.SickGiven}</td>
                  <td>{row.PVGiven}</td>
                  <td>{row.SickRemain}</td>
                  <td>{row.PVRemain}</td>
                  {months.map((mon, mIdx) => {
                    const sickKey = `${mon}_S`;
                    const pvKey = `${mon}_PV`;
                    return (
                      <React.Fragment key={mIdx}>
                        <td className={styles.sickCol}>{row[sickKey] ?? 0}</td>
                        <td className={styles.pvCol}>{row[pvKey] ?? 0}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              )) : (
                <tr>
                  <td colSpan={6 + months.length*2} style={{ textAlign: 'center', color: '#888' }}>
                    선택된 직원의 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PayrollSickPage;
