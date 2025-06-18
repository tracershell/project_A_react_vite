// client/src/pages/admin/account/AccountPettyMoneyPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import styles from './AccountPettyMoneyPage.module.css';
import axios from 'axios';
import AccountPettyMoneySubmitPage from './AccountPettyMoneySubmitPage';

const AccountPettyMoneyPage = () => {
  const [form, setForm] = useState({ pldate: '', plcredit: '0', pldebit: '0', plcomment: '' });
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSubmitPage, setShowSubmitPage] = useState(false);
  const inputsRef = useRef([]);
  const handleFocusSelectAll = e => e.target.select();

  const handleKeyDown = (idx, e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    inputsRef.current[idx + 1]?.focus();
  }
};

  const fetchList = async () => {
    const { data } = await axios.get('/api/admin/account/accountpettymoney/list');
    setList(data);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    try {
      await axios.post('/api/admin/account/accountpettymoney/add', form);
      setForm(f => ({
  ...f,
  plcredit: '0',
  pldebit: '0',
  plcomment: ''
}));
      fetchList();
    } catch (err) {
      alert('입력 오류: ' + err.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedId) return;
    try {
      await axios.put(`/api/admin/account/accountpettymoney/edit/${selectedId}`, form);
      setForm({ pldate: '', plcredit: '', pldebit: '', plcomment: '' });
      setSelectedId(null);
      fetchList();
    } catch (err) {
      alert('수정 오류: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await axios.delete(`/api/admin/account/accountpettymoney/delete/${selectedId}`);
      setForm({ pldate: '', plcredit: '', pldebit: '', plcomment: '' });
      setSelectedId(null);
      fetchList();
    } catch (err) {
      alert('삭제 오류: ' + err.message);
    }
  };

  const handleViewPdf = async () => {
    try {
      const url = `/api/admin/account/accountpettymoney/viewpdf?start=${startDate}&end=${endDate}`;
      window.open(url);
    } catch (err) {
      alert('PDF 보기 오류: ' + err.message);
    }
  };

  const selectRow = row => {
    setForm({
      pldate: row.pldate?.split('T')[0] || '',
      plcredit: row.plcredit,
      pldebit: row.pldebit,
      plcomment: row.plcomment
    });
    setSelectedId(row.id);
  };

  const handleShowSubmitPage = () => {
  if (!startDate || !endDate) {
    alert('시작일과 종료일을 먼저 입력하세요.');
    return;
  }
  setShowSubmitPage(true);
};

  return (
    <div className={styles.page}>
      <h2>Petty Money Ledger</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '50%' }}>
        
        <input
  ref={el => inputsRef.current[0] = el}
  type="date"
  name="pldate"
  value={form.pldate}
  onChange={handleChange}
  onKeyDown={e => handleKeyDown(0, e)}
  style={{ width: '8rem' }}
/>
<input
  ref={el => inputsRef.current[1] = el}
  type="number"
  name="plcredit"
  value={form.plcredit}
  placeholder="Credit"
  step="any"  // step 표시 제거
  onChange={handleChange}
  onKeyDown={e => handleKeyDown(1, e)}
  onFocus={handleFocusSelectAll}
/>
<input
  ref={el => inputsRef.current[2] = el}
  type="number"
  name="pldebit"
  value={form.pldebit}
  placeholder="Debit"
  step="any"  // step 표시 제거
  onChange={handleChange}
  onKeyDown={e => handleKeyDown(2, e)}
  onFocus={handleFocusSelectAll}
/>
<input
  ref={el => inputsRef.current[3] = el}
  name="plcomment"
  value={form.plcomment}
  placeholder="Comment"
  onChange={handleChange}
  onKeyDown={e => handleKeyDown(3, e)}
  onFocus={handleFocusSelectAll}
/>
        <button onClick={handleAdd}>입력</button>
        <button onClick={handleEdit} disabled={!selectedId}>수정</button>
        <button onClick={handleDelete} disabled={!selectedId}>제거</button>
      </div>

      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '50%' }}>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '8rem' }} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '8rem' }} />
        <button onClick={handleViewPdf}>PDF 보기</button>
        <button onClick={handleShowSubmitPage}>Submit Ledger</button>
      </div>
      </div>

      <h2>Ledger List</h2>
      <div className={styles.list}>
        {showSubmitPage && (
  <AccountPettyMoneySubmitPage
    startDate={startDate}
    endDate={endDate}
    onBack={() => setShowSubmitPage(false)}
  />
)}

        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Credit</th>
              <th>Debit</th>
              <th>Balance</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {list.map(row => (
              <tr key={row.id} onClick={() => selectRow(row)}>
                <td>{row.pldate?.split('T')[0]}</td>
                <td>{Number(row.plcredit).toFixed(2)}</td>
                <td>{Number(row.pldebit).toFixed(2)}</td>
                <td>{Number(row.plbalance).toFixed(2)}</td>
                <td>{row.plcomment}</td>
              </tr>
            ))}
          </tbody>
        </table>       

      </div>
    </div>
  );
};

export default AccountPettyMoneyPage;
