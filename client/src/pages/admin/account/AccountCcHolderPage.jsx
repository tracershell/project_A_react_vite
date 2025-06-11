// 📁 client/src/pages/admin/account/AccountCcHolderPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AccountCcHolderPage.module.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api/admin/account/accountccholderpage',
  headers: { 'Content-Type': 'application/json' },
});

const AccountCcHolderPage = () => {
  const [holders, setHolders] = useState([]);
  const [form, setForm] = useState({
    id: '', provider: '', anumber: '', holder: '', hnumber: '', hlimit: '', hnote: ''
  });
  const navigate = useNavigate();

  useEffect(() => { fetchHolders(); }, []);

  const fetchHolders = async () => {
    const { data } = await api.get('/list');
    if (Array.isArray(data)) setHolders(data);
    else {
      console.warn('⚠️ API 응답이 배열이 아님:', data);
      setHolders([]);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.provider || !form.anumber || !form.holder) return alert('필수 항목을 입력하세요.');
    try {
      await api.post('/add', form);
      alert('입력 완료');
      resetForm();
      fetchHolders();
    } catch (err) {
      alert(err.response?.data?.error || '입력 실패');
    }
  };

  const handleUpdate = async (id) => {
    const record = holders.find(h => h.id === id);
    if (!record) return;
    try {
      await api.post('/update', record);
      alert('수정 완료');
      fetchHolders();
    } catch {
      alert('수정 실패');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await api.post('/delete', { id });
      alert('삭제 완료');
      fetchHolders();
    } catch {
      alert('삭제 실패');
    }
  };

  const resetForm = () => {
    setForm({ id: '', provider: '', anumber: '', holder: '', hnumber: '', hlimit: '', hnote: '' });
  };

  const handleRecordChange = (id, field, value) => {
    setHolders(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  return (
    <div className={styles.page}>
      <h2>Account Holder Input</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className={`${styles.formRow} ${styles.small}`}>  
          <label>Provider</label>
          <input type="text" name="provider" value={form.provider} onChange={handleChange} />
          <label>A. No.</label>
          <input type="text" name="anumber" value={form.anumber} onChange={handleChange} />
          <label>Holder</label>
          <input type="text" name="holder" value={form.holder} onChange={handleChange} />
          <label>C. No.</label>
          <input type="text" name="hnumber" value={form.hnumber} onChange={handleChange} />
          <label>Limit</label>
          <input type="number" name="hlimit" value={form.hlimit} onChange={handleChange} />
          <label>Note</label>
          <input type="text" name="hnote" value={form.hnote} onChange={handleChange} className={styles.remarkInput} />
        </div>

        <div className={styles.formRow}>
          <button className={styles.submitBtn} onClick={handleSubmit}>입력</button>
          <button className={styles.submitBtn} onClick={resetForm}>초기화</button>
          <button className={styles.lightPink} onClick={() => navigate(-1)}>되돌아가기</button>
        </div>
      </div>

      <h2>Account Holder List</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.payTable}>
          <thead>
            <tr><th>Provider</th><th>Account</th><th>Holder</th><th>No</th><th>Limit</th><th>Note</th><th>Action</th></tr>
          </thead>
          <tbody>
            {holders.map(h => (
              <tr key={h.id}>
                <td><input value={h.provider} onChange={e => handleRecordChange(h.id, 'provider', e.target.value)} /></td>
                <td><input value={h.anumber} onChange={e => handleRecordChange(h.id, 'anumber', e.target.value)} /></td>
                <td><input value={h.holder} onChange={e => handleRecordChange(h.id, 'holder', e.target.value)} /></td>
                <td><input value={h.hnumber} onChange={e => handleRecordChange(h.id, 'hnumber', e.target.value)} /></td>
                <td><input value={h.hlimit} onChange={e => handleRecordChange(h.id, 'hlimit', e.target.value)} /></td>
                <td><input value={h.hnote} onChange={e => handleRecordChange(h.id, 'hnote', e.target.value)} /></td>
                <td>
                  <button className={styles.submitBtn} onClick={() => handleUpdate(h.id)}>수정</button>
                  <button className={styles.submitBtn} onClick={() => handleDelete(h.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountCcHolderPage;
