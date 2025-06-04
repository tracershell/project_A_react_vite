// client/src/pages/admin/payroll/PayrollIndividualPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PayrollIndividualPage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

const PayrollTaxAuditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 초기 전달값 받아오기
  const { start: initialStart, end: initialEnd, payrecords: initialRecords = [] } = location.state || {};

  const [start, setStart] = useState(initialStart || '');
  const [end, setEnd] = useState(initialEnd || '');
  const [payrecords, setPayrecords] = useState(initialRecords);
  const [grouped, setGrouped] = useState([]);
  const [viewMode, setViewMode] = useState('individual'); // 'summary' or 'individual'

  // ✅ 🔄 payrecords 변경 시 grouped 재구성
  useEffect(() => {
    if (payrecords.length === 0) return;
    const groupedData = payrecords.reduce((acc, cur) => {
      const key = `${cur.eid}-${cur.name}`;
      if (!acc[key]) acc[key] = { info: cur, rows: [] };
      acc[key].rows.push(cur);
      return acc;
    }, {});
    setGrouped(Object.values(groupedData));
  }, [payrecords]);

  // ✅ 처음 로드됐는데 전달받은 데이터가 없을 경우 fetch
  useEffect(() => {
    if (initialRecords.length === 0 && start && end) {
      fetchAudit();
    }
  }, []);

  // ✅ 서버에서 데이터 검색
  const fetchAudit = async () => {
    try {
      const { data } = await axios.get('/api/admin/payroll/payrollindividual/audit-result', {
        params: { start, end }
      });
      console.log('✅ Loaded from server:', data);  // ✅ 콘솔 확인용
      setPayrecords(data);
    } catch (err) {
    const msg = err.response?.data?.error || '알 수 없는 오류가 발생했습니다.';
    alert(`⚠️ ${msg}`);
  }
};

const handleViewPDF = async () => {
  try {
    const payload = { start, end, payrecords };  // ✅ 서버로 전송할 데이터
    const res = await axios.post(
      '/api/admin/payroll/payrollindividual/pdf/individual',
      payload,
      { responseType: 'blob' }
    );
    const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    window.open(pdfUrl);
  } catch (err) {
    alert('기간입력하고 검색후 보세요 -PDF 생성 실패 ' + (err.response?.data || '오류'));
  }
};

  // ✅ CSV 다운로드 함수형(onClick) 방식
  const handleCsvDownload = () => {
    if (!start || !end) {
      alert('시작일과 종료일을 입력한 후에 시도해주세요.');
      return;
    }
    // 새 탭/창으로 CSV 엔드포인트를 호출 → 다운로드 시작
    window.open(`/api/admin/payroll/payrollindividual/csv?start=${start}&end=${end}`, '_blank');
  };


  return (
    <div className={styles.page}>
      <h2>View by Individual</h2>

      {/* 검색 조건 입력 */}
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Start</label>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        <label>End</label>
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <button className={styles.lightBlue} onClick={fetchAudit}>🔍 검색</button>
        <button className={styles.lightBlue} onClick={() => navigate(-1)}>🔙 돌아가기</button>

        {/* PDF/CSV 버튼 */}
        <button
         type="button"
         className={styles.lightBlue}
         onClick={handleViewPDF}  // ✨ 수정: handleViewPDF에서 POST 요청 수행
         style={{ display: 'inline' }}
       >
         📄 PDF 보기
       </button>
        {/* ✅ CSV 저장을 함수형(onClick)으로 처리 */}
        <button
          type="button"
          className={styles.lightBlue}
          onClick={handleCsvDownload}  // 함수 호출
          style={{ display: 'inline', marginLeft: '5px' }}
        >
          💾 CSV 저장
        </button>
      </div>

      {/* 개인별 테이블 */}
      <div className={`${styles.groupBox}`} style={{ border: '1px solid #ccc', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <strong>Audit Period: </strong>
        <span style={{ color: '#007bff', fontWeight: 'bold' }}>{start}</span>
        <span> ~ </span>
        <span style={{ color: '#007bff', fontWeight: 'bold' }}>{end}</span>
      </div>

      {grouped.map((group, idx) => (
        <div key={idx} style={{ marginBottom: '2rem' }}>
          <div>
            <strong>EID:</strong> {group.info.eid}
            <strong style={{ marginLeft: '1rem' }}>Name:</strong> {group.info.name}
            <strong style={{ marginLeft: '1rem' }}>Job Title:</strong> {group.info.jtitle}
            <strong style={{ marginLeft: '1rem' }}>Job Code:</strong> {group.info.jcode}
          </div>

          <table className={styles.payTable} style={{ marginTop: '0.5rem' }}>
            <thead>
              <tr>
                {['Date', 'Check No', 'Wages', 'RTime', 'O.Time', 'D.Time', 'Remark'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.pdate?.split('T')[0]}</td>
                  <td>{r.ckno}</td>
                  <td>{Number(r.gross).toFixed(2)}</td>
                  <td>{Number(r.rtime).toFixed(2)}</td>
                  <td>{Number(r.otime).toFixed(2)}</td>
                  <td>{Number(r.dtime).toFixed(2)}</td>
                  <td>{r.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PayrollTaxAuditPage;
