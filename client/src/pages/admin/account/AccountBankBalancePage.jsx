// 📁 client/src/pages/admin/account/AccountBankBalancePage.jsx
import React, { useState, useEffect, useRef } from 'react'; // useRef 추가
import styles from './AccountBankBalancePage.module.css';
import axios from 'axios';

const AccountBankBalancePage = () => {
  const [records, setRecords] = useState([]);
  const inputRefs = useRef([]);  // 이제 정상 정의됨

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data } = await axios.get('/api/admin/account/accountbankbalance');
      const formatted = data.map((r) => ({
        ...r,
        checked: r.selected === 1,
      }));
      setRecords(formatted);
    } catch (err) {
      console.error('불러오기 오류:', err);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...records];
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
      const formatted = records.map((r, i) => ({
        row_index: i + 1,
        category: r.category || '',
        item: r.item || '',
        amount: parseFloat(r.amount) || 0,
        comment: r.comment || '',
        selected: r.checked ? 1 : 0,
      }));

      await axios.post('/api/admin/account/accountbankbalance/save', { records: formatted });
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
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '12px' }}>
        <form className={styles.formRow} style={{ width: '50%' }} onSubmit={e => e.preventDefault()}>
          <button type="button" onClick={handleUpdate}>저장</button>
          <button type="button" onClick={handlePDF}>PDF 보기</button>
        </form>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '12px' }}>
        <div className={styles.list} style={{ width: '50%' }}>
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
              {Array.from({ length: 20 }).map((_, i) => {
                const rec = records[i] || {
                  category: '',
                  item: '',
                  amount: '',
                  comment: '',
                  checked: false,
                };
                return (
                  <tr key={i}>
                    <td>
                      <input
                        type="checkbox"
                        checked={rec.checked}
                        onChange={() => handleChange(i, 'checked')}
                        ref={(el) => (inputRefs.current[i * 5 + 0] = el)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            inputRefs.current[i * 5 + 1]?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={rec.category}
                        onChange={(e) => handleChange(i, 'category', e.target.value)}
                        ref={(el) => (inputRefs.current[i * 5 + 1] = el)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            inputRefs.current[i * 5 + 2]?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={rec.item}
                        onChange={(e) => handleChange(i, 'item', e.target.value)}
                        ref={(el) => (inputRefs.current[i * 5 + 2] = el)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            inputRefs.current[i * 5 + 3]?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                    <td className="amountCell">
                      <input
                        type="text"
                        style={{
                          textAlign: 'right',
                          color: Number(rec.amount) < 0 ? 'red' : 'inherit',
                        }}
                        value={
                          Number(rec.amount) < 0
                            ? `(${Math.abs(Number(rec.amount)).toLocaleString()})`
                            : Number(rec.amount || 0).toLocaleString()
                        }
                        onChange={(e) => {
                          const numeric = e.target.value.replace(/[(),]/g, '').replace(/\s+/g, '');
                          const actual = e.target.value.includes('(') ? '-' + numeric : numeric;
                          handleChange(i, 'amount', actual);
                        }}
                        ref={(el) => (inputRefs.current[i * 5 + 3] = el)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            inputRefs.current[i * 5 + 4]?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={rec.comment}
                        onChange={(e) => handleChange(i, 'comment', e.target.value)}
                        ref={(el) => (inputRefs.current[i * 5 + 4] = el)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            // 다음 row 첫 번째 필드로 포커스 이동
                            inputRefs.current[(i + 1) * 5 + 0]?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountBankBalancePage;
