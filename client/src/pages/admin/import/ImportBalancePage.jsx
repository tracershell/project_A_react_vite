import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ImportBalancePage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ImportBalancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rows = [], vendor_id } = location.state || {};
  const [bpDate, setBpDate] = useState('');
  const [exRate, setExRate] = useState('');
  const [records, setRecords] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (rows?.length) setRecords(rows);
  }, [rows]);

  const applyExRate = () => {
    setRecords(recs =>
      recs.map(r => ({
        ...r,
        bp_amount_usd:
          r.bp_amount_rmb && exRate
            ? (parseFloat(r.bp_amount_rmb) / parseFloat(exRate)).toFixed(2)
            : r.bp_amount_usd,
        bp_exrate: exRate,
      }))
    );
  };

  const handlePay = async () => {
    if (!bpDate || !exRate) return alert('BP Date/Exchange Rate를 입력하세요');
    try {
      for (const rec of records) {
        await axios.post('/api/admin/import/balance/add', {
          po_id: rec.id,
          vendor_id,
          bp_date: bpDate,
          bp_exrate: exRate,
          bp_amount_rmb: rec.bp_amount_rmb,
          bp_amount_usd: rec.bp_amount_usd,
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
      <h2>Balance Pay</h2>
      <div>
        <input
          type="date"
          value={bpDate}
          onChange={e => setBpDate(e.target.value)}
          placeholder="BP Date"
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
            <th>BP Amount(RMB)</th>
            <th>BP Amount(USD)</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td>{r.vendor_name}</td>
              <td>{r.po_no}</td>
              <td>{r.style_no}</td>
              <td>{r.bp_amount_rmb}</td>
              <td>{r.bp_amount_usd}</td>
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

export default ImportBalancePage;
