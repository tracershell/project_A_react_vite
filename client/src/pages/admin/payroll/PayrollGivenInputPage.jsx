// ✅ Given Sick & Paid Vacation 관리 화면
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollSickInputPage.module.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api/admin/payroll/giveninput',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('authToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const PayrollGivenInputPage = () => {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ id: '', eid: '', name: '', sickgiven: '', pvgiven: '', remark: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchEmployees(); fetchRecords(); }, []);

  const fetchEmployees = async () => {
    const { data } = await api.get('/employees');
    setEmployees(data);
  };

  const fetchRecords = async () => {
    const { data } = await api.get('/list');
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

  const handleSubmit = async () => {
    if (!form.eid || !form.name) return alert('이름을 선택하세요');
    try {
      await api.post('/add', form);
      alert('저장 완료');
      resetForm();
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.error || '저장 실패');
    }
  };

  const handleUpdate = async (id) => {
    const record = records.find(r => r.id === id);
    if (!record) return;
    try {
      await api.post('/update', record);
      alert('수정 완료');
      fetchRecords();
    } catch {
      alert('수정 실패');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await api.post('/delete', { id });
      alert('삭제 완료');
      fetchRecords();
    } catch {
      alert('삭제 실패');
    }
  };

  const resetForm = () => {
    setForm({ id: '', eid: '', name: '', sickgiven: '', pvgiven: '', remark: '' });
  };

  const handleRecordChange = (id, field, value) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className={styles.page}>
      <h2>Given Sick & Paid Vacation Input</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className={`${styles.formRow} ${styles.small}`}>
        <label style={{ minWidth: '6rem' }}>Select Name</label>
        <select name="name" value={form.name} onChange={handleChange} className={styles.nameSelect}>
          <option value="">-- Select --</option>
          {employees.map(e => <option key={e.eid} value={e.name}>{e.name}</option>)}
        </select>
        <label style={{ whiteSpace: 'nowrap', minWidth: '5rem' }}>Sick Given</label>
        <input type="text" name="sickgiven" value={form.sickgiven} onChange={handleChange} />
        <label>PV Given</label>
        <input type="text" name="pvgiven" value={form.pvgiven} onChange={handleChange} />
        <label>Remark</label>
        <input type="text" name="remark" value={form.remark} onChange={handleChange} className={styles.remarkInput} />
      </div>

      <div className={styles.formRow}>
        <button className={styles.submitBtn} onClick={handleSubmit}>입력</button>
        <button className={styles.lightBlue} onClick={resetForm}>초기화</button>
        <button className={styles.lightBlue} onClick={() => navigate(-1)}>되돌아가기</button>
      </div>
</div>
      <h2>Given Sick & Paid Vacation List</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.payTable}>
          <thead>
            <tr><th>EID</th><th>Name</th><th>Sick Given</th><th>Paid Vacation Given</th><th>Remark</th><th>Action</th></tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.eid}</td>
                <td>{r.name}</td>
                <td><input value={r.sickgiven} onChange={e => handleRecordChange(r.id, 'sickgiven', e.target.value)} /></td>
                <td><input value={r.pvgiven} onChange={e => handleRecordChange(r.id, 'pvgiven', e.target.value)} /></td>
                <td><input value={r.remark} onChange={e => handleRecordChange(r.id, 'remark', e.target.value)} /></td>
                <td>
                  <button className={styles.submitBtn} onClick={() => handleUpdate(r.id)}>수정</button>
                  <button className={styles.submitBtn} onClick={() => handleDelete(r.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollGivenInputPage;
