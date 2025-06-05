import React, { useState } from 'react';
import styles from './PayrollSalaryAdjustPage.module.css';
import axios from 'axios';

const PayrollSalaryAdjustPage = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [deduction, setDeduction] = useState('');
  const [salary, setSalary] = useState('');
  const [result, setResult] = useState(null);

  // "계산" 버튼 클릭 시 실행
  const calculateSalary = () => {
    if (!month || !salary || deduction === '') {
      alert('모든 항목을 입력해 주세요');
      return;
    }

    const totalDays = new Date(year || currentYear, month, 0).getDate();
    let saturdays = 0;
    let sundays = 0;
    for (let i = 1; i <= totalDays; i++) {
      const day = new Date(year || currentYear, month - 1, i).getDay();
      if (day === 6) saturdays++;
      if (day === 0) sundays++;
    }

    const workDays = totalDays - saturdays - sundays;
    const actualDays = workDays - parseInt(deduction, 10);
    const adjusted = salary * (actualDays / workDays);
    const fixed = Math.round(adjusted);

    setResult({
      totalDays,
      saturdays,
      sundays,
      workDays,
      actualDays,
      originalSalary: parseFloat(salary).toFixed(2),
      adjSalary: adjusted.toFixed(2),
      fixSalary: fixed.toFixed(2),
    });
  };

  // "PDF 보기" 버튼 클릭 시 실행
  const openPdf = async () => {
    if (!result) {
      alert('먼저 계산을 해 주세요');
      return;
    }

    try {
      const params = new URLSearchParams({
        year: year || currentYear,
        month,
        deduction,
        totalDays: result.totalDays,
        saturdays: result.saturdays,
        sundays: result.sundays,
        workDays: result.workDays,
        adjustedWorkDays: result.actualDays,
        adjSalary: result.adjSalary,
        fixSalary: result.fixSalary,
        originalSalary: result.originalSalary,
      });

      const response = await axios.get(
        `/api/admin/payroll/payrollsalaryadjust/salary_adjust_viewpdf?${params.toString()}`,
        { responseType: 'blob' }
      );

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('PDF 생성/로딩 중 오류:', err);
      alert('PDF 보기 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.page} >
      <h2>Salary Adjustment Calculation</h2>
      <div style={ {display: 'flex', gap: '1rem', marginBottom: '12px'}}></div>
        {/* formRow.small 을 함께 붙이면, 내부 select/input/button 들이
          모두 동일한 높이, 동일한 패딩 기준으로 수평 정렬됩니다. */}
      <div className={`${styles.formRow} ${styles.small}`} style={{ flex: '0 0 auto', width: '45rem' }}>
        {/* 년도 선택 */}
        <select
          className={`${styles.select5rem}`}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">년도 선택</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={2024 + i}>
              {2024 + i}년
            </option>
          ))}
        </select>

        {/* 월 선택 */}
        <select
          className={`${styles.select5rem}`}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">월 선택</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}월
            </option>
          ))}
        </select>

        {/* 공제일 수 입력 */}
        <input
          type="number"
          placeholder="공제일 수"
          className={styles.smallInput}
          value={deduction}
          min="0"
          onChange={(e) => setDeduction(e.target.value)}
        />

        {/* 월 급여 입력 */}
        <input
          type="number"
          step="0.01"
          placeholder="월 급여 ($)"
          className={styles.smallInput}
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />

        {/* 계산 버튼 */}
        <button className={styles.lightBlue} onClick={calculateSalary}>
          📠 계 산
        </button>

        {/* PDF 보기 버튼 */}
        <button className={styles.lightBlue} onClick={openPdf}>
          🖨️ PDF 보기
        </button>
      </div>
     

      {result && (
        <div className={styles.results}>
          <div className={styles.resultLine}>총 일수: {result.totalDays}일</div>
          <div className={styles.resultLine}>토요일: {result.saturdays}일</div>
          <div className={styles.resultLine}>일요일: {result.sundays}일</div>
          <div className={styles.resultLine}>근무일수: {result.workDays}일</div>
          <div className={styles.resultLine}>실근무일수: {result.actualDays}일</div>
          <div className={styles.resultLine}>기본급: ${result.originalSalary}</div>
          <div className={styles.resultLine}>조정급여: ${result.adjSalary}</div>
          <div className={styles.resultLine}>
            반올림금액: <b>${result.fixSalary}</b>
          </div>
          <div className={styles.resultLine}>
            수식: (
            {result.originalSalary} × {result.actualDays}) ÷{' '}
            {result.workDays} = ${result.adjSalary}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollSalaryAdjustPage;
