import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ImportDepositPage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ImportDepositPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rows = [], vendor_id } = location.state || {};
  const [dpDate, setDpDate] = useState('');
  const [exRate, setExRate] = useState('');
  const [records, setRecords] = useState([]);
  const [comment, setComment] = useState('');

  // 페이지 진입 시 받은 rows를 보여주기
  useEffect(() => {
    if (rows?.length) setRecords(rows);
  }, [rows]);

  // 환율 적용
  const applyExRate = () => {
    setRecords(recs =>
      recs.map(r => ({
        ...r,
        dp_amount_usd:
          r.dp_amount_rmb && exRate
            ? (parseFloat(r.dp_amount_rmb) / parseFloat(exRate)).toFixed(2)
            : r.dp_amount_usd,
        dp_exrate: exRate,
      }))
    );
  };

  // Pay
  const handlePay = async () => {
    if (!dpDate || !exRate) return alert('DP Date/Exchange Rate를 입력하세요');
    try {
      for (const rec of records) {
        await axios.post('/api/admin/import/deposit/add', {
          po_id: rec.id,
          vendor_id,
          dp_date: dpDate,
          dp_exrate: exRate,
          dp_amount_rmb: rec.dp_amount_rmb,
          dp_amount_usd: rec.dp_amount_usd,
          comment,
        });
      }
      alert('저장 완료!');
      navigate('/admin/import/po');
    } catch (err) {
      alert('저장 중 오류');
    }
  };

  return (
    <div className={styles.page}>
      <h2>Deposit Pay</h2>
      <div>
        <input
          type="date"
          value={dpDate}
          onChange={e => setDpDate(e.target.value)}
          placeholder="DP Date"
        />
        <input
          type="number"
          step="0.0001"
          value={exRate}
          onChange={e => setExRate(e.target.value)}
          placeholder="Exchange Rate"
        />
        <button type="button" onClick={applyExRate}>환율적용</button>
        <button type="button" onClick={handlePay}>Pay</button>
        <button type="button" onClick={() => navigate('/admin/import/po')}>되돌아가기</button>
      </div>
      <table className={styles.compactTable}>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>PO No</th>
            <th>Style</th>
            <th>DP Amount(RMB)</th>
            <th>DP Amount(USD)</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td>{r.vendor_name}</td>
              <td>{r.po_no}</td>
              <td>{r.style_no}</td>
              <td>{r.dp_amount_rmb}</td>
              <td>{r.dp_amount_usd}</td>
              <td>
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Comment"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportDepositPage;
