// client/src/pages/admin/account/AccountCreditCardPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AccountCreditCardPage.module.css';
import { useNavigate } from 'react-router-dom'; 

const api = axios.create({
  baseURL: '/api/admin/account/accountcreditcardpage',
  headers: { 'Content-Type': 'application/json' },
});

const AccountCreditCardPage = () => {
  const [dates, setDates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [summaryRecord, setSummaryRecord] = useState({});
  const [details, setDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
  try {
    const { pdates = [], providers = [] } = await api.get('/meta').then(res => res.data);

    // 날짜와 카드사를 직접 할당
    setDates(pdates.map(d => d.pdate?.slice(0, 10)).filter(Boolean).sort());
    setProviders(providers.map(p => p.provider).filter(Boolean).sort());
  } catch (err) {
    console.error('meta fetch 실패:', err);
  }
};

  useEffect(() => {
    if (!selectedDate || !selectedProvider) return;

    const fetchSummaryAndDetails = async () => {
      try {
        const [summaryRes, detailsRes] = await Promise.all([
          api.get('/summary', { params: { pdate: selectedDate, provider: selectedProvider } }),
          api.get('/details', { params: { pdate: selectedDate, provider: selectedProvider } }),
        ]);
        setSummaryRecord(summaryRes.data || {});
        setDetails(detailsRes.data || []);
      } catch (err) {
        console.error('summary/details fetch 오류:', err);
        setSummaryRecord({});
        setDetails([]);
      }
    };

    fetchSummaryAndDetails();
  }, [selectedDate, selectedProvider]);

  const total = details.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);

  const handlePdfView = () => {
  if (!selectedDate || !selectedProvider) {
    alert('결제일과 카드사를 선택하세요.');
    return;
  }

  const query = new URLSearchParams({
    pdate: selectedDate,
    provider: selectedProvider,
  }).toString();

  window.open(`/api/admin/account/accountcreditcardpage/cc_summary_pdf?${query}`, '_blank');
};

  const handlePayInput = () => navigate('/admin/account/ccpayinput');
  const handleItemInput = () => navigate('/admin/account/cciteminput');
  const handleHolderInput = () => navigate('/admin/account/ccholderinput');



  return (
    <div className={styles.page}>
      <h2>Credit Card Payment Summary</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
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

        <button className={styles.lightBlue} onClick={handlePdfView}>PDF 보기</button>
      </div>
      <div className={styles.formRow} style={{ width: '20%' }}>
          <button type="button" className={styles.lightPink} onClick={handlePayInput}>Pay Input</button>
          <button type="button" className={styles.lightPink} onClick={handleItemInput}>Item Input</button>
          <button type="button" className={styles.lightPink} onClick={handleHolderInput}>Holder Input</button>
      </div>
      </div>
      {selectedDate && selectedProvider && (
  <div className={styles.summaryBox} style={{ width: '50%', marginTop: '1rem' }}>
    <div className={styles.infoRow} style={{ display: 'flex', gap: '2rem', fontSize: '1.1rem', fontWeight: '500' }}>
      <span>유형: {summaryRecord.ptype}</span>
      <span>Check번호: {summaryRecord.ptname}</span>
      <span>결제금액: {Number(summaryRecord.pamount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      <span>카드번호: {summaryRecord.anumber}</span>
    </div>

    <table className={styles.payTable} style={{ marginTop: '1rem', width: '100%' }}>
      <thead>
        <tr><th>항목</th><th>금액</th></tr>
      </thead>
      <tbody>
        {details.map(({ aitem, total }) => (
          <tr key={aitem}>
            <td>{aitem}</td>
            <td style={{ textAlign: 'center' }}>
              {Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        ))}
        <tr>
          <td style={{ fontWeight: 'bold' }}>합계</td>
          <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
            {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}

    </div>
  );
};

export default AccountCreditCardPage;
