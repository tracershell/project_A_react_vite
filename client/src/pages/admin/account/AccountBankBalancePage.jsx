// 📁 client/src/pages/admin/account/AccountBankBalancePage.jsx
import React, { useState, useEffect } from 'react';
import styles from './AccountBankBalancePage.module.css';
import axios from 'axios';

const AccountBankBalancePage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data } = await axios.get('/api/admin/account/accountbankbalance');
      setRecords(data);
    } catch (err) {
      console.error('불러오기 오류:', err);
    }
  };

  const handleChange = (index, field, value) => {
    // deep copy
    const updated = [...records];
    // if records[index] is undefined, 먼저 빈 객체 세팅
    if (!updated[index]) {
      updated[index] = { category: '', item: '', amount: '', comment: '', checked: false };
    }
    if (field === 'checked') {
      updated[index].checked = !updated[index].checked;
    } else {
      updated[index][field] = value;
    }
    setRecords(updated);
  };

  const handleUpdate = async () => {
    try {
      await axios.post('/api/admin/account/accountbankbalance/save', { records });
      alert('저장 완료');
      fetchRecords();
    } catch (err) {
      console.error('저장 오류:', err);
      alert('저장 실패');
    }
  };

  const handlePDF = async () => {
    try {
      const res = await axios.post(
        '/api/admin/account/accountbankbalance/pdf',
        {},
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url);
    } catch (err) {
      console.error('PDF 오류:', err);
      alert('PDF 생성 실패');
    }
  };

  return (
    <div className={styles.page}>
      <h2>Bank Balance</h2>
      <div className={styles.buttonRow}>
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handlePDF}>PDF 보기</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>선택</th>
            <th>Category</th>
            <th>Item</th>
            <th>Amount</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {
            // 1부터 20까지 고정 라인 생성
            Array.from({ length: 20 }).map((_, i) => {
              // 데이터가 있는 경우엔 그 값을, 없으면 기본값 객체
              const rec = records[i] || { category: '', item: '', amount: '', comment: '', checked: false };
              return (
                <tr key={i}>
                  <td>
                    <input
                      type="checkbox"
                      checked={rec.checked}
                      onChange={() => handleChange(i, 'checked')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={rec.category}
                      onChange={e => handleChange(i, 'category', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={rec.item}
                      onChange={e => handleChange(i, 'item', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={rec.amount}
                      onChange={e => handleChange(i, 'amount', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={rec.comment}
                      onChange={e => handleChange(i, 'comment', e.target.value)}
                    />
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
};

export default AccountBankBalancePage;
