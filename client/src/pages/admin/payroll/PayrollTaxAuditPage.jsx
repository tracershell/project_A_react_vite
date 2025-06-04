// client/src/pages/admin/payroll/PayrollTaxAuditPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollTaxPage.module.css';
// 1️⃣ useNavigate() 활용한 페이지 이동
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';  // ✅ 상단 import에 추가

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


  const handleAllPdf = async () => {
    if (!start || !end) {
      alert('시작일과 종료일을 입력해주세요.');
      return;
    }

    try {
      const payload = { start, end };  // ✅ 날짜 전송

      const response = await axios.post(
        '/api/admin/payroll/payrolltaxaudit/pdf/all',  // ✅ 기존 GET → POST로 변경
        payload,
        { responseType: 'blob' }                        // ✅ PDF 파일로 응답
      );

      const pdfUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(pdfUrl);  // ✅ 새 창에서 PDF 열기

    } catch (err) {
      const msg = err.response?.data?.error || 'PDF 생성 오류';
      alert(`⚠️ ${msg}`);
    }
  };

  // ✅ payrecords 변경될 때마다 합계를 다시 계산
const totals = useMemo(() => {
  return payrecords.reduce(
    (acc, r) => {
      acc.gross += Number(r.gross) || 0;
      acc.rtime += Number(r.rtime) || 0;
      acc.otime += Number(r.otime) || 0;
      acc.dtime += Number(r.dtime) || 0;
      return acc;
    },
    { gross: 0, rtime: 0, otime: 0, dtime: 0 }
  );
}, [payrecords]);


  return (
    <div className={styles.page}>
      <h2>Payroll Tax Audit</h2>

      {/* 검색 조건 입력 */}
      {/* 한 줄에 두 개의 border box 구성 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '12px' }}>
        {/* Box 1: 날짜 선택 + 검색 + 돌아가기 + PDF + CSV */}
        <div className={`${styles.formRow} ${styles.small}`} style={{ flex: 1 }}>
          <label>Start</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
          <label>End</label>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
          <button className={styles.lightBlue} onClick={fetchAudit}>🔍 검색</button>
          <button className={styles.lightBlue} onClick={() => navigate(-1)}>🔙 돌아가기</button>
          <button className={styles.lightBlue} onClick={handleAllPdf}>📄 전체 PDF</button>
          <form action="/api/admin/payroll/payrolltaxaudit/pdfdownload" method="get" target="_blank" style={{ display: 'inline', marginLeft: '5px' }}>
            <input type="hidden" name="start" value={start} />
            <input type="hidden" name="end" value={end} />
            <button type="submit" className={styles.lightBlue}>💾 CSV 저장</button>
          </form>
        </div>

        {/* Box 2: 개인별 보기 + 분류별 보기 */}
        <div className={`${styles.formRow} ${styles.small}`} style={{ flex: '0 0 auto' }}>
          <button
            className={styles.lightBlue}
            onClick={() =>
              navigate('/admin/payroll/taxaudit/individual', {
                state: { start, end, payrecords }
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
        </div>
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
          <tfoot>
  <tr>
    <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>합계</td>
    <td>{totals.gross.toFixed(2)}</td>     {/* ✅ Wages 합계 */}
    <td>{totals.rtime.toFixed(2)}</td>     {/* ✅ R.Time 합계 */}
    <td>{totals.otime.toFixed(2)}</td>     {/* ✅ O.Time 합계 */}
    <td>{totals.dtime.toFixed(2)}</td>     {/* ✅ D.Time 합계 */}
    <td></td>
  </tr>
</tfoot>


        </table>
      </div>
    </div>
  );
};

export default PayrollTaxAuditPage;
