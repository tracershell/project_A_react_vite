// 📁 client/src/pages/admin/account/AccountApPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AccountApPage.module.css';

const AccountApPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [beginning, setBeginning] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchData(year);
  }, [year]);

  const fetchData = async (yr) => {
    try {
      const { data } = await axios.get(`/api/admin/account/ap?year=${yr}`, { withCredentials: true });
      setBeginning(data.beginning_amount || 0);
      setMonthlyData(data.monthly || []);
    } catch (err) {
      alert('데이터 불러오기 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleBeginningSave = async () => {
    try {
      await axios.post(`/api/admin/account/ap/beginning`, { amount: beginning }, { withCredentials: true });
      alert('초기값 저장 완료');
    } catch (err) {
      alert('저장 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleExportCSV = () => {
    // 추후 구현
    alert('CSV 기능 준비 중');
  };

  const handlePdf = () => {
    window.open(`/api/admin/account/ap/pdf?year=${year}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <h2>AP beginning Amount</h2>
      <div className={styles.formRow}>
        <input
          type="number"
          value={beginning}
          onChange={(e) => setBeginning(e.target.value)}
        />
        <button onClick={handleBeginningSave}>수정</button>
      </div>

      <h2>AP Table</h2>
      <div className={styles.formRow}>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {Array.from({ length: 10 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
        <button onClick={handlePdf}>PDF 보기</button>
        <button onClick={handleExportCSV}>CSV 출력</button>
      </div>

      <table className={styles.compactTable}>
        <thead>
          <tr>
            <th>Month</th>
            <th>Purchase</th>
            <th>Payment</th>
            <th>AP Report</th>
          </tr>
        </thead>
        <tbody>
          {monthlyData.map((m, idx) => (
            <tr key={idx}>
              <td>{m.month_name} ({m.end_date})</td>
              <td>{m.pur_sum.toLocaleString()}</td>
              <td>{m.pay_sum.toLocaleString()}</td>
              <td>{m.ap_sum.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountApPage;
