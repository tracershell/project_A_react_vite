import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ImportDepositPage.module.css';

const ImportDepositPage = () => {
  const [records, setRecords] = useState([]);
  const [exrate, setExrate] = useState('');
  const [dpDate, setDpDate] = useState('');
  const [totalRMB, setTotalRMB] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem('depositRecords');
    if (saved) {
      const parsed = JSON.parse(saved);
      const enriched = parsed.map(r => ({
        ...r,
        dp_amount_rmb: (r.amount * r.deposit_rate / 100).toFixed(2),
        exrate: 1,
        dp_amount_usd: 0
      }));
      setRecords(enriched);
    }
  }, []);

  const applyExchangeRate = () => {
    if (!exrate || isNaN(exrate)) return alert('환율을 입력하세요.');
    const newRecords = records.map(r => {
      const usd = (parseFloat(r.dp_amount_rmb) / parseFloat(exrate)).toFixed(2);
      return { ...r, exrate, dp_amount_usd: usd };
    });
    setRecords(newRecords);

    const totalR = newRecords.reduce((sum, r) => sum + parseFloat(r.dp_amount_rmb), 0);
    const totalU = newRecords.reduce((sum, r) => sum + parseFloat(r.dp_amount_usd), 0);
    setTotalRMB(totalR.toFixed(2));
    setTotalUSD(totalU.toFixed(2));
  };

  const handlePay = async () => {
    if (!dpDate || !exrate) return alert('날짜와 환율을 입력하세요.');
    try {
      await axios.post('/api/admin/import/deposit/pay', {
        records,
        dp_date: dpDate,
        exrate
      });
      alert('저장 완료');
      window.location.href = '/admin/import/po';
    } catch (err) {
      alert(err.response?.data?.error || '저장 오류');
    }
  };

  return (
    <div className={styles.page}>
      <h2>Deposit Pay List</h2>

      <div className={styles.controlBox}>
        <label>
          DP Date:
          <input type="date" value={dpDate} onChange={e => setDpDate(e.target.value)} />
        </label>
        <label>
          Exchange Rate:
          <input type="number" value={exrate} onChange={e => setExrate(e.target.value)} step="0.0001" />
        </label>
        <button onClick={applyExchangeRate}>환율적용</button>
        <button onClick={handlePay}>Pay</button>
        <button
          onClick={() => window.open(`/api/admin/import/deposit/pdf?date=${dpDate}&exrate=${exrate}`, '_blank')}
        >
          📄 PDF 보기
        </button>
      </div>

      <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PO No</th>
              <th>Vendor</th>
              <th>PO Amount</th>
              <th>Rate%</th>
              <th>DP RMB</th>
              <th>Exrate</th>
              <th>DP USD</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={idx}>
                <td>{r.po_no}</td>
                <td>{r.vendor_id}</td>
                <td>{r.amount}</td>
                <td>{r.deposit_rate}</td>
                <td>{r.dp_amount_rmb}</td>
                <td>{r.exrate}</td>
                <td>{r.dp_amount_usd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.totalBox}>
        <p>Total RMB: {totalRMB}</p>
        <p>Total USD: {totalUSD}</p>
      </div>
    </div>
  );
};

export default ImportDepositPage;
