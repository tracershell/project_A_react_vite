// ✅ File: client/src/pages/admin/payroll/PayrollClassificationPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PayrollIndividualPage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

const PayrollClassificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { start: initialStart, end: initialEnd, payrecords: initialRecords = [] } = location.state || {};

  const [start, setStart] = useState(initialStart || '');
  const [end, setEnd] = useState(initialEnd || '');
  const [payrecords, setPayrecords] = useState(initialRecords);
  const [grouped, setGrouped] = useState([]);

  useEffect(() => {
    if (payrecords.length === 0) return;
    const groupedData = payrecords.reduce((acc, cur) => {
      const key = cur.jcode;
      if (!acc[key]) acc[key] = { code: cur.jcode, title: cur.jtitle, rows: [] };
      acc[key].rows.push(cur);
      return acc;
    }, {});
    setGrouped(Object.values(groupedData));
  }, [payrecords]);

  useEffect(() => {
    if (initialRecords.length === 0 && start && end) {
      fetchAudit();
    }
  }, []);

  const fetchAudit = async () => {
    try {
      const { data } = await axios.get('/api/admin/payroll/payrollclassification/audit-result', {
        params: { start, end },
      });
      console.log('✅ Loaded by job code:', data);
      setPayrecords(data);
    } catch (err) {
    const msg = err.response?.data?.error || '알 수 없는 오류가 발생했습니다.';
    alert(`⚠️ ${msg}`);
  }
};

// “PDF 보기” 버튼 클릭 시: POST로 payrecords, start, end 전송 → blob 응답 → 새 탭에 표시
  const handleViewPDF = async () => {
    try {
      const payload = { start, end, payrecords };
      const res = await axios.post(
        '/api/admin/payroll/payrollclassification/pdf/classification',
        payload,
        { responseType: 'blob' }
      );
      const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(pdfUrl);
    } catch (err) {
      alert('PDF 생성 실패: ' + (err.response?.data || '오류'));
    }
  };

  // “CSV 저장” 버튼 클릭 시: GET → 새 탭/창에서 CSV 요청
  const handleCsvDownload = () => {
    if (!start || !end) {
      alert('시작일과 종료일을 입력한 후에 시도해주세요.');
      return;
    }
    window.open(`/api/admin/payroll/payrollclassification/csv?start=${start}&end=${end}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <h2>View by Classification</h2>

      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Start</label>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        <label>End</label>
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <button className={styles.lightBlue} onClick={fetchAudit}>🔍 검색</button>
        <button className={styles.lightBlue} onClick={() => navigate(-1)}>🔙 돌아가기</button>
        <button
          type="button"
          className={styles.lightBlue}
          onClick={handleViewPDF}
          style={{ display: 'inline' }}
        >
          📄 PDF 보기
        </button>
        <button
          type="button"
          className={styles.lightBlue}
          onClick={handleCsvDownload}
          style={{ display: 'inline', marginLeft: '5px' }}
        >
          💾 CSV 저장
        </button>
      </div>

      <div className={styles.groupBox} style={{ border: '1px solid #ccc', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <strong>Audit Period: </strong>
        <span style={{ color: '#007bff', fontWeight: 'bold' }}>{start}</span>
        <span> ~ </span>
        <span style={{ color: '#007bff', fontWeight: 'bold' }}>{end}</span>
      </div>

      {grouped.map((group, idx) => {
        // ✅ 해당 그룹(rows[])에서 합계 계산
        const wagesSum = group.rows.reduce((sum, r) => sum + (Number(r.gross) || 0), 0);
        const rtimeSum = group.rows.reduce((sum, r) => sum + (Number(r.rtime) || 0), 0);
        const otimeSum = group.rows.reduce((sum, r) => sum + (Number(r.otime) || 0), 0);
        const dtimeSum = group.rows.reduce((sum, r) => sum + (Number(r.dtime) || 0), 0);

        return (
          <div key={idx} style={{ marginBottom: '2rem' }}>
            {/* 그룹 정보 (Job Code) */}
            <div>
              <strong>Job Code:</strong> {group.code}
              <strong style={{ marginLeft: '1rem' }}>Job Title:</strong> {group.title}
            </div>

            <table className={styles.payTable} style={{ marginTop: '0.5rem' }}>
              <thead>
                <tr>
                  {[
                    'Pay Date',
                    'Check No',
                    'EID',
                    'Name',
                    'J.Title',
                    'Wages',
                    'R.Time',
                    'O.Time',
                    'D.Time',
                    'Remark'
                  ].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.pdate?.split('T')[0]}</td>
                    <td>{r.ckno}</td>
                    <td>{r.eid}</td>
                    <td>{r.name}</td>
                    <td>{r.jtitle}</td>
                    <td>{Number(r.gross).toFixed(2)}</td>
                    <td>{Number(r.rtime).toFixed(2)}</td>
                    <td>{Number(r.otime).toFixed(2)}</td>
                    <td>{Number(r.dtime).toFixed(2)}</td>
                    <td>{r.remark}</td>
                  </tr>
                ))}
              </tbody>
              {/* ✅ 그룹별 합계 행 추가 */}
              <tfoot>
                <tr>
                  <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>합계</td>
                  <td style={{ fontWeight: 'bold' }}>{wagesSum.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold' }}>{rtimeSum.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold' }}>{otimeSum.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold' }}>{dtimeSum.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
};


export default PayrollClassificationPage;
