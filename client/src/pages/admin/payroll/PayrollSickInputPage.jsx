// client/src/pages/admin/payroll/PayrollSickInputPage.jsx

// ✅ Sick Day 관리 화면 (입력/수정/삭제 + 리스트 테이블)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollSickInputPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react'; 

const api = axios.create({
  baseURL: '/api/admin/payroll/sickinput',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('authToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const PayrollSickInputPage = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ id: '', eid: '', name: '', sickdate: '', sicktime: '', sickhour: '', remark: '' });
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (form.eid) fetchRecords(form.eid);
  }, [form.eid]);

  const fetchEmployees = async () => {
    const { data } = await api.get('/employees');
    setEmployees(data);
  };

  const fetchRecords = async (eid) => {
    const { data } = await api.get(`/list?eid=${eid}`);
    setRecords(data);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'name') {
      const emp = employees.find(x => x.name === value);
      setForm(f => ({ ...f, name: value, eid: emp?.eid || '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const hhmmToDecimal = (val) => {
    const [hh, mm] = val.split(':').map(Number);
    if (isNaN(hh) || isNaN(mm) || mm >= 60) return null;
    return (hh + mm / 60).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!form.eid || !form.sickdate || !form.sicktime) return alert('모든 항목을 입력하세요');
    const hour = hhmmToDecimal(form.sicktime);
    if (hour === null) return alert('시간 형식 오류 (예: 1:30)');

    try {
      await api.post('/add', { ...form, sickhour: hour });
      alert('저장 완료');
      setForm({ id: '', eid: form.eid, name: form.name, sickdate: '', sicktime: '', sickhour: '', remark: '' });
      fetchRecords(form.eid);
    } catch {
      alert('저장 실패');
    }
  };

  const handleSelect = (r) => {
    setForm({
      id: r.id,
      eid: r.eid,
      name: r.name,
      sickdate: r.sickdate?.split('T')[0],
      sicktime: '',
      sickhour: r.sickhour,
      remark: r.remark || '',
    });
  };

  const handleUpdate = async () => {
    const hour = hhmmToDecimal(form.sicktime);
    if (hour === null) return alert('시간 형식 오류');
    try {
      await api.post('/update', { ...form, sickhour: hour });
      alert('수정 완료');
      setForm(f => ({ ...f, sickdate: '', sicktime: '', sickhour: '', remark: '' }));
      fetchRecords(form.eid);
    } catch {
      alert('수정 실패');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await api.post('/delete', { id: form.id });
      alert('삭제 완료');
      setForm(f => ({ ...f, sickdate: '', sicktime: '', sickhour: '', remark: '' }));
      fetchRecords(form.eid);
    } catch {
      alert('삭제 실패');
    }
  };

  const resetForm = () => {
    setForm(f => ({ ...f, sickdate: '', sicktime: '', sickhour: '', remark: '' }));
  };

  const navigate = useNavigate();

  const totalSickHour = useMemo(() => {
  return records
    .filter(r => !!r.sickdate)
    .reduce((acc, r) => acc + (parseFloat(r.sickhour) || 0), 0)
    .toFixed(2);
}, [records]);


  return (
    <div className={styles.page}>
      <h2>Sick Day Input</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '45rem' }}>
        <label style={{ minWidth: '6rem' }}>Select Name</label>
        <select name="name" value={form.name} onChange={handleChange} className={styles.nameSelect}>
          <option value="">-- Select --</option>
          {employees.map(e => <option key={e.eid} value={e.name}>{e.name}</option>)}
        </select>
      </div>

      <div className={styles.formRow}>
        <label>Sick Date</label>
        <input type="date" name="sickdate" value={form.sickdate} onChange={handleChange} />

        <label>Sick Time (hh:mm)</label>
        <input type="text" name="sicktime" value={form.sicktime} onChange={handleChange} placeholder="1:30" />

        <label>Remark</label>
        <input type="text" name="remark" value={form.remark} onChange={handleChange} className={styles.remarkInput} />
      </div>
        <div className={styles.formRow}>
        <button className={styles.submitBtn} onClick={handleSubmit}>입력</button>
        <button className={styles.lightBlue} onClick={handleUpdate}>수정</button>
        <button className={styles.lightBlue} onClick={handleDelete}>삭제</button>
        <button className={styles.lightBlue} onClick={resetForm}>초기화</button>
        <button className={styles.lightBlue} onClick={() => navigate(-1)}>되돌아가기</button>
      </div>

      </div>

      <h2>Sick Day List</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.payTable}>
  <thead>
    <tr>
      <th>Sick Date</th><th>Sick Hour</th><th>Remark</th>
    </tr>
  </thead>
  <tbody>
    {records.filter(r => !!r.sickdate).length === 0 ? (
      <tr><td colSpan="3">No records found.</td></tr>
    ) : (
      records
        .filter(r => !!r.sickdate)
        .map(r => (
          <tr key={r.id} onClick={() => handleSelect(r)} style={{ cursor: 'pointer' }}>
            <td>{r.sickdate?.split('T')[0]}</td>
            <td>{Number(r.sickhour).toFixed(2)}</td>
            <td>{r.remark}</td>
          </tr>
        ))
    )}
  </tbody>
  {/* ✅ 합계 표시용 tfoot 추가 */}
  {records.filter(r => !!r.sickdate).length > 0 && (
    <tfoot>
      <tr>
        <td style={{ fontWeight: 'bold', color: 'red', textAlign: 'center' }}>Total</td>
        <td style={{ fontWeight: 'bold', color: 'red' }}>{totalSickHour}</td>
        <td></td>
      </tr>
    </tfoot>
  )}
</table>

      </div>
    </div>
  );
};

export default PayrollSickInputPage;
