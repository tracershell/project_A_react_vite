  // 📁 client/src/pages/admin/account/AccountCcItemPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AccountCcItemPage.module.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api/admin/account/accountccitempage', // ✅ 
  headers: { 'Content-Type': 'application/json' },
});

const CreditCardItemPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ id: '', aitem: '', icode: '', inote: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
  const { data } = await api.get('/list');
  if (Array.isArray(data)) {
    setItems(data);
  } else {
    console.warn('⚠️ API 응답이 배열이 아님:', data);
    setItems([]);
  }
};

  
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.aitem || !form.icode) return alert('모든 항목을 입력하세요.');
    try {
      await api.post('/add', form);
      alert('입력 완료');
      resetForm();
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || '입력 실패');
    }
  };

  const handleUpdate = async (id) => {
    const record = items.find(i => i.id === id);
    if (!record) return;
    try {
      await api.post('/update', record);
      alert('수정 완료');
      fetchItems();
    } catch {
      alert('수정 실패');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await api.post('/delete', { id });
      alert('삭제 완료');
      fetchItems();
    } catch {
      alert('삭제 실패');
    }
  };

  const resetForm = () => {
    setForm({ id: '', aitem: '', icode: '', inote: '' });
  };

  const handleRecordChange = (id, field, value) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className={styles.page}>
      <h2>Account Item Input</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className={`${styles.formRow} ${styles.small}`}>
          <label style={{ minWidth: '6rem' }}>Account Item</label>
          <input type="text" name="aitem" value={form.aitem} onChange={handleChange} />
          <label style={{ minWidth: '5rem' }}>Item Code</label>
          <input type="text" name="icode" value={form.icode} onChange={handleChange} />
          <label>Note</label>
          <input type="text" name="inote" value={form.inote} onChange={handleChange} className={styles.remarkInput} />
        </div>
        <div className={styles.formRow}>
          <button className={styles.submitBtn} onClick={handleSubmit}>입력</button>
          <button className={styles.submitBtn} onClick={resetForm}>초기화</button>
          <button className={styles.lightPink} onClick={() => navigate(-1)}>되돌아가기</button>
        </div>
      </div>

      <h2>Account Item List</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.payTable}>
          <thead>
            <tr><th>Item</th><th>Code</th><th>Note</th><th>Action</th></tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td><input value={i.aitem} onChange={e => handleRecordChange(i.id, 'aitem', e.target.value)} /></td>
                <td><input value={i.icode} onChange={e => handleRecordChange(i.id, 'icode', e.target.value)} /></td>
                <td><input value={i.inote} onChange={e => handleRecordChange(i.id, 'inote', e.target.value)} /></td>
                <td>
                  <button className={styles.submitBtn} onClick={() => handleUpdate(i.id)}>수정</button>
                  <button className={styles.submitBtn} onClick={() => handleDelete(i.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreditCardItemPage;
