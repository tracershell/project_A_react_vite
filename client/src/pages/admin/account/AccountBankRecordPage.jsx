// 📁 client/src/pages/admin/account/AccountBankRecordPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './AccountBankRecordPage.module.css';
import axios from 'axios';

const AccountBankRecordPage = () => {  
  const [form, setForm] = useState({ date: '', rtype: '', amount: '', comment: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [list, setList] = useState([]);
  const [brStart, setBrStart] = useState('');
  const [brEnd, setBrEnd] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRefs = useRef([]);

  const fetchList = async () => {
    if (!brStart || !brEnd) return;
    try {
      const { data } = await axios.get(`/api/admin/account/bankrecord?start=${brStart}&end=${brEnd}`);
      setList(data);
    } catch (err) {
      alert('조회 실패: ' + err.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, [brStart, brEnd]);

  const handleChange = e => {
    const { name, value } = e.target;
    let val = name === 'amount' ? value.replace(/,/g, '') : value;
    if (name === 'amount' && isNaN(Number(val))) return;
    setForm(f => ({ ...f, [name]: val }));
  };

  const formatAmount = val => {
    const num = Number(val);
    return isNaN(num) ? '' : num.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = inputRefs.current[idx + 1];
      if (next) {
        next.focus();
        next.setSelectionRange(0, next.value.length);
      }
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post('/api/admin/account/bankrecord/add', form);
      setForm({ date: '', rtype: '', amount: '', comment: '' });
      fetchList();
    } catch (err) {
      alert('입력 오류: ' + err.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedId) return;
    try {
      await axios.put(`/api/admin/account/bankrecord/edit/${selectedId}`, form);
      setForm({ date: '', rtype: '', amount: '', comment: '' });
      setSelectedId(null);
      fetchList();
    } catch (err) {
      alert('수정 오류: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await axios.delete(`/api/admin/account/bankrecord/delete/${selectedId}`);
      setForm({ date: '', rtype: '', amount: '', comment: '' });
      setSelectedId(null);
      fetchList();
    } catch (err) {
      alert('삭제 오류: ' + err.message);
    }
  };

  const selectRow = row => {
    setForm({
      date: row.date?.split('T')[0] || '',
      rtype: row.rtype,
      amount: row.amount,
      comment: row.comment,
    });
    setSelectedId(row.id);
  };

  const handlePdf = () => {
    window.open(`/api/admin/account/bankrecord/pdf?start=${brStart}&end=${brEnd}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <h2>Bank Record Data Input</h2>
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} ref={el => inputRefs.current[0] = el} onKeyDown={e => handleKeyDown(0, e)} />
        <label>Record Type</label>
        <input name="rtype" value={form.rtype} onChange={handleChange} ref={el => inputRefs.current[1] = el} onKeyDown={e => handleKeyDown(1, e)} />
        <label>Amount</label>
        <input name="amount" value={isEditing ? form.amount : formatAmount(form.amount)}
          onChange={handleChange} ref={el => inputRefs.current[2] = el} onKeyDown={e => handleKeyDown(2, e)}
          onFocus={() => setIsEditing(true)} onBlur={() => setIsEditing(false)} />
        <label>Comment</label>
        <input name="comment" value={form.comment} onChange={handleChange} ref={el => inputRefs.current[3] = el} onKeyDown={e => handleKeyDown(3, e)} />
        <button onClick={handleAdd}>입력</button>
        <button onClick={handleEdit} disabled={!selectedId}>수정</button>
        <button onClick={handleDelete} disabled={!selectedId}>삭제</button>
      </div>

      <h2>Bank Record Report</h2>
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>검색 시작</label>
        <input type="date" value={brStart} onChange={e => setBrStart(e.target.value)} />
        <label>검색 끝</label>
        <input type="date" value={brEnd} onChange={e => setBrEnd(e.target.value)} />
        <button className={styles.lightBlue} onClick={handlePdf}>PDF 보기</button>
      </div>

      <div className={styles.list}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Record Type</th>
              <th>Amount</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, idx) => (
              <tr key={idx} onClick={() => selectRow(row)}>
                <td>{row.date?.split('T')[0]}</td>
                <td>{row.rtype}</td>
                <td>{formatAmount(row.amount)}</td>
                <td>{row.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountBankRecordPage;
