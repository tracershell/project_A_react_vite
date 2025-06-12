// 📁 client/src/pages/admin/account/AccountCreditCardPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import styles from './AccountCreditCardPage.module.css';

const api = axios.create({
  baseURL: '/api/admin/account/accountcreditcardpage',
  headers: { 'Content-Type': 'application/json' },
});

const AccountCreditCardPage = () => {
  const [records, setRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [dates, setDates] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetchMeta();
    fetchRecords();
  }, []);

  const fetchMeta = async () => {
  try {
    const { data } = await api.get('/meta');
    const { pdates, providers } = data;
    setDates(pdates.map(d => d.pdate?.slice(0, 10)).sort());
    setProviders(providers.map(p => p.provider).sort());
  } catch (err) {
    console.error('meta fetch 실패:', err);
  }
};


  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/list');
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('목록 오류:', err);
      setRecords([]);
    }
  };

  const filtered = records.filter(
    r => r.pdate?.slice(0, 10) === selectedDate && r.provider === selectedProvider
  );

  const summary = useMemo(() => {
    const map = {};
    filtered.forEach(r => {
      map[r.aitem] = (map[r.aitem] || 0) + parseFloat(r.uamount || 0);
    });
    return map;
  }, [filtered]);

  const total = Object.values(summary).reduce((sum, val) => sum + val, 0);

  const summaryRecord = filtered[0] || {};

  return (
    <div className={styles.page}>
      <h2>Credit Card Payment Summary</h2>

      <div className={styles.formRow} style={{ width: '50%' }}>
        <label>결제일</label>
        <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
          <option value="">-- 선택 --</option>
          {dates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>

        <label>카드사</label>
        <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}>
          <option value="">-- 선택 --</option>
          {providers.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button className={styles.lightBlue}>PDF 보기</button>
      </div>

      {selectedDate && selectedProvider && (
        <div className={styles.summaryBox}>
          <div className={styles.infoRow}>
            <span>유형: {summaryRecord.ptype}</span>
            <span>Check번호: {summaryRecord.ptname}</span>
            <span>결제금액: {summaryRecord.pamount}</span>
            <span>카드번호: {summaryRecord.anumber}</span>
          </div>

          <table className={styles.payTable}>
            <thead>
              <tr><th>항목</th><th>금액</th></tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([aitem, amount]) => (
                <tr key={aitem}>
                  <td>{aitem}</td>
                  <td style={{ textAlign: 'right' }}>{amount.toLocaleString()}</td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 'bold' }}>합계</td>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>{total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountCreditCardPage;
