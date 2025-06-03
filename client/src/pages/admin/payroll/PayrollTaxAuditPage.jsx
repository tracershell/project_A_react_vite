// client/src/pages/admin/payroll/PayrollTaxAuditPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollTaxPage.module.css';
// 1️⃣ useNavigate() 활용한 페이지 이동
import { useNavigate } from 'react-router-dom';

const PayrollTaxAuditPage = () => {
  const navigate = useNavigate();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [payrecords, setPayrecords] = useState([]);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'individual'


  const fetchAudit = async () => {
  try {
    const { data } = await axios.get('/api/admin/payroll/payrolltaxaudit/audit-result', {
      params: { start, end }
    });
    console.log("✅ payrecords 결과:", data);
    setPayrecords(data);
  } catch (err) {
    const msg = err.response?.data?.error || '알 수 없는 오류가 발생했습니다.';
    alert(`⚠️ ${msg}`);
  }
};

  return (
    <div className={styles.page}>
      <h2>Payroll Tax Audit</h2>

      {/* 검색 조건 입력 */}
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Start</label>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        <label>End</label>
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <button className={styles.lightBlue} onClick={fetchAudit}>🔍 검색</button>
        <button className={styles.lightBlue} onClick={() => navigate(-1)}>🔙 돌아가기</button>
        <button
  className={styles.lightBlue}
  onClick={() =>
    navigate('/admin/payroll/taxaudit/individual', {
      state: { start, end, payrecords } // ✅ 상태로 start/end/payrecords 전달
    })
  }
>
  👤 개인별 보기
</button>
<button
  className={styles.lightBlue}
  onClick={() =>
    navigate('/admin/payroll/taxaudit/classification', {
      state: { start, end, payrecords }
    })
  }
>
  🗂️ 분류별 보기
</button>
        
        <form action="/api/admin/payroll/payrolltaxaudit/pdf" method="get" target="_blank" style={{ display: 'inline' }}>
          <input type="hidden" name="start" value={start} />
          <input type="hidden" name="end" value={end} />
          <button type="submit" className={styles.lightBlue}>📄 AUDIT 보기</button>
        </form>
        <form action="/api/admin/payroll/payrolltaxaudit/pdfdownload" method="get" target="_blank" style={{ display: 'inline', marginLeft: '5px' }}>
          <input type="hidden" name="start" value={start} />
          <input type="hidden" name="end" value={end} />
          <button type="submit" className={styles.lightBlue}>💾 CSV 저장</button>
        </form>
      </div>

      {/* 결과 테이블 */}
      <div className={styles.tableWrapper}>
        <table className={styles.payTable}>
          <thead>
            <tr>
             {['Pay Date', 'Check No', 'EID', 'Name', 'J.Title', 'J.Code', 'Wages', 'R.Time', 'O.Time', 'D.Time', 'Remark'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payrecords.length === 0 ? (
              <tr><td colSpan="8">검색 결과가 없습니다.</td></tr>
            ) : (
              payrecords.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.pdate?.split('T')[0]}</td>
                  <td>{r.ckno}</td>
                  <td>{r.eid}</td>
                  <td>{r.name}</td>
                  <td>{r.jtitle}</td>
                  <td>{r.jcode}</td>
                  <td>{Number(r.gross).toFixed(2)}</td>
                  <td>{Number(r.rtime).toFixed(2)}</td>
                  <td>{Number(r.otime).toFixed(2)}</td>
                  <td>{Number(r.dtime).toFixed(2)}</td>
                  <td>{r.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollTaxAuditPage;
