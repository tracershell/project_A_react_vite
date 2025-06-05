
import React, { useState } from 'react';
// ✂ 수정: 기존 CSS 모듈 경로 유지 (이 예제에서는 PayrollSalaryAdjustPage.module.css로 가정)
import styles from './PayrollSalaryAdjustPage.module.css';

// * Axios를 사용해 PDF를 Blob으로 받아오기 위해 import 합니다.
import axios from 'axios';

const PayrollSalaryAdjustPage = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [deduction, setDeduction] = useState('');
  const [salary, setSalary] = useState('');
  const [result, setResult] = useState(null);

  // “계산” 버튼 클릭 시 실행 (이 부분은 건들지 않습니다)
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

  // “PDF 보기” 버튼 클릭 시 실행
  const openPdf = async () => {
    if (!result) {
      alert('먼저 계산을 해 주세요');
      return;
    }

    // ✂ 수정: React 단순 window.open 대신, Axios로 PDF를 Blob으로 가져와서 새 탭에 띄우도록 변경
    try {
      // 1) 쿼리 파라미터 생성 (기존 로직 유지)
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

      // 2) Axios GET 요청, responseType: 'blob'으로 PDF 데이터(바이너리) 받아오기
      //    - 엔드포인트는 백엔드에서 설정한 경로를 사용해야 합니다.
      //    예시: Express 쪽 app.js에서 app.use('/api/admin/payroll/payrollsalaryadjust', ...) 로 마운트했다면
      //    실제 URL은 "/api/admin/payroll/payrollsalaryadjust/salary_adjust_viewpdf" 가 됩니다.
      const response = await axios.get(
        /api/admin/payroll/payrollsalaryadjust/salary_adjust_viewpdf?${params.toString()},
        { responseType: 'blob' }
      );

      // 3) 받은 Blob을 URL.createObjectURL 로 변환하고 새 탭으로 열기
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('PDF 생성/로딩 중 오류:', err);
      alert('PDF 보기 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.page}>
      <h2>Salary Adjustment Calculation</h2>

      <div className={styles.formRow}>
        {/* 년도 선택 (화면 25% 폭) */}
        <select
          className={styles.quarterWidth}
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

        {/* 월 선택 (화면 25% 폭) */}
        <select
          className={styles.quarterWidth}
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

        {/* 공제일 수 입력 (고정 폭 8rem) */}
        <input
          type="number"
          placeholder="공제일 수"
          className={styles.smallInput}
          value={deduction}
          min="0"
          onChange={(e) => setDeduction(e.target.value)}
        />

        {/* 월 급여 입력 (고정 폭 8rem) */}
        <input
          type="number"
          step="0.01"
          placeholder="월 급여 ($)"
          className={styles.smallInput}
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />

        {/* 계산 버튼 (기존 로직) */}
        <button className={styles.lightBlue} onClick={calculateSalary}>
          계산
        </button>

        {/* PDF 보기 버튼 → 위 openPdf 수정분 사용 */}
        <button className={styles.lightBlue} onClick={openPdf}>
          PDF 보기
        </button>
      </div>

      {result && (
        <div
          className="results"
          style={{
            marginTop: '20px',
            border: '1px solid #ccc',
            padding: '12px',
            background: 'white',
          }}
        >
          <div>총 일수: {result.totalDays}일</div>
          <div>토요일: {result.saturdays}일</div>
          <div>일요일: {result.sundays}일</div>
          <div>근무일수: {result.workDays}일</div>
          <div>실근무일수: {result.actualDays}일</div>
          <div>기본급: ${result.originalSalary}</div>
          <div>조정급여: ${result.adjSalary}</div>
          <div>
            반올림금액: <b>${result.fixSalary}</b>
          </div>
          <div>
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