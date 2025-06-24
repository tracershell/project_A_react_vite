// ✅ client/src/pages/admin/account/AccountArPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './AccountArPage.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountArPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ar_date: '', hq_sales: '', sr_sales: '', ar_report: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [list, setList] = useState([]);
  const [searchYear, setSearchYear] = useState(new Date().getFullYear());
  const inputRefs = useRef([]);
  const [isEditing, setIsEditing] = useState({ hq_sales: false, sr_sales: false, ar_report: false });


  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;
    if (['hq_sales', 'sr_sales', 'ar_report'].includes(name)) {
      newValue = value.replace(/,/g, '');
      if (isNaN(Number(newValue))) return;
    }
    setForm(f => ({ ...f, [name]: newValue }));
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

  const handleFocus = (e) => {
    e.target.setSelectionRange(0, e.target.value.length);
  };

  const formatAmount = val => {
  const num = Number(val);
  return isNaN(num) ? '' : num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
  const fetchList = async () => {
    try {
      const { data } = await axios.get(`/api/admin/account/ar?year=${searchYear}`);
      setList(data);
    } catch (err) {
      alert('데이터 불러오기 오류: ' + err.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, [searchYear]);

  const handleAdd = async () => {
    try {
      await axios.post('/api/admin/account/ar/add', form);
      setForm({ ar_date: '', hq_sales: '', sr_sales: '', ar_report: '' });
      fetchList();
    } catch (err) {
      alert('입력 오류: ' + err.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedId) return;
    try {
      await axios.put(`/api/admin/account/ar/edit/${selectedId}`, form);
      setForm({ ar_date: '', hq_sales: '', sr_sales: '', ar_report: '' });
      setSelectedId(null);
      fetchList();
    } catch (err) {
      alert('수정 오류: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await axios.delete(`/api/admin/account/ar/delete/${selectedId}`);
      setForm({ ar_date: '', hq_sales: '', sr_sales: '', ar_report: '' });
      setSelectedId(null);
      fetchList();
    } catch (err) {
      alert('삭제 오류: ' + err.message);
    }
  };

  const handlePdf = () => {
    window.open(`/api/admin/account/ar/pdf?year=${searchYear}`, '_blank');
  };

  const selectRow = (row) => {
    setForm({
      ar_date: row.ar_date?.split('T')[0] || '',
      hq_sales: row.hq_sales,
      sr_sales: row.sr_sales,
      ar_report: row.ar_report
    });
    setSelectedId(row.id);
  };

  

  return (
    <div className={styles.page}>
      <h2>AR Data Input</h2>
      <div className={`${styles.formRow} ${styles.small}`} style={{ flexWrap: 'wrap' }}>
        <label style={{ whiteSpace: 'nowrap' }}>Date</label>
        <input
          ref={el => inputRefs.current[0] = el}
          type="date"
          name="ar_date"
          value={form.ar_date}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(0, e)}
        />
        <label style={{ whiteSpace: 'nowrap' }}>HQ Sales</label>
        <input
  ref={el => inputRefs.current[1] = el}
  name="hq_sales"
  value={isEditing.hq_sales ? form.hq_sales : formatAmount(form.hq_sales)}
  onChange={handleChange}
  onKeyDown={e => handleKeyDown(1, e)}
  onFocus={(e) => {
    setIsEditing(prev => ({ ...prev, hq_sales: true }));
    e.target.setSelectionRange(0, e.target.value.length);
  }}
  onBlur={() => setIsEditing(prev => ({ ...prev, hq_sales: false }))}
  placeholder="HQ Sales"
/>

<label style={{ whiteSpace: 'nowrap' }}>Showroom Sales</label>
<input
  ref={el => inputRefs.current[2] = el}
  name="sr_sales"
  value={isEditing.sr_sales ? form.sr_sales : formatAmount(form.sr_sales)}
  onChange={handleChange}
  onKeyDown={e => handleKeyDown(2, e)}
  onFocus={(e) => {
    setIsEditing(prev => ({ ...prev, sr_sales: true }));
    e.target.setSelectionRange(0, e.target.value.length);
  }}
  onBlur={() => setIsEditing(prev => ({ ...prev, sr_sales: false }))}
  placeholder="Showroom Sales"
/>

<label style={{ whiteSpace: 'nowrap' }}>A/R Report</label>
<input
  ref={el => inputRefs.current[3] = el}
  name="ar_report"
  value={isEditing.ar_report ? form.ar_report : formatAmount(form.ar_report)}
  onChange={handleChange}
  onKeyDown={e => handleKeyDown(3, e)}
  onFocus={(e) => {
    setIsEditing(prev => ({ ...prev, ar_report: true }));
    e.target.setSelectionRange(0, e.target.value.length);
  }}
  onBlur={() => setIsEditing(prev => ({ ...prev, ar_report: false }))}
  placeholder="AR Report"
/>
        <button onClick={handleAdd}>입력</button>
        <button onClick={handleEdit} disabled={!selectedId}>수정</button>
        <button onClick={handleDelete} disabled={!selectedId}>삭제</button>
      </div>

      <h2>Sales and AR Report</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className={`${styles.formRow} ${styles.small}`} style={{ width: '50%' }}>
          <input
            type="number"
            value={searchYear}
            onChange={e => setSearchYear(e.target.value)}
            placeholder="검색년도"
            className={styles.fixedWidth8}
            style={{ width: '8rem' }}
          />
          <button className={styles.lightBlue} onClick={fetchList}>검색</button>
          <button className={styles.lightBlue} onClick={handlePdf}>PDF 보기</button>
          <button className={styles.lightPink} onClick={() => navigate(-1)}>되돌아 가기</button>
        </div>
      </div>

      <div className={styles.list}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th>Month</th>
              <th>HQ Sales</th>
              <th>Showroom Sales</th>
              <th>Total Sales</th>
              <th>AR Report</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, idx) => (
              <tr key={idx} onClick={() => selectRow(row)}>
                <td>{row.ar_date?.slice(0, 7)}</td>
                <td>{Number(row.hq_sales).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td>{Number(row.sr_sales).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td>{(Number(row.hq_sales) + Number(row.sr_sales)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td>{Number(row.ar_report).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountArPage;