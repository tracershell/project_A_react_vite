// 📁 client/src/pages/admin/account/AccountApPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './AccountApPage.module.css';
import { useNavigate } from 'react-router-dom';

const AccountApPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  // beginningRaw: 콤마 없는 숫자 문자열 상태
  const [beginningRaw, setBeginningRaw] = useState('');
  // isEditing: input에 포커스가 있을 때 true → raw 편집 모드
  const [isEditing, setIsEditing] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const navigate = useNavigate();

  // 1) 서버에서 데이터 가져오기: beginning_amount과 monthly
  const fetchData = useCallback(async (yr) => {
    try {
      const { data } = await axios.get(`/api/admin/account/ap?year=${yr}`, { withCredentials: true });
      const amt = data.beginning_amount;
      // 안전하게 콤마 없는 raw 문자열로 변환
      const raw = (amt != null && !isNaN(Number(amt))) ? String(Math.floor(Number(amt))) : '';
      setBeginningRaw(raw);
      setMonthlyData(Array.isArray(data.monthly) ? data.monthly : []);
    } catch (err) {
      alert('데이터 불러오기 실패: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  // 2) 연도 변경 또는 초기 마운트 시 데이터 로드
  useEffect(() => {
    fetchData(year);
  }, [year, fetchData]);

  // 3) 입력값 표시용: 편집 중(isEditing)일 때는 raw, 아니면 천 단위 콤마 붙인 값
  const getDisplayValue = () => {
    if (!beginningRaw) return '';
    // raw에서 콤마 제거 후 숫자 변환
    const num = Number(beginningRaw.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString(); // ex: 3000 -> "3,000"
  };

  // 4) input onChange 핸들러: 콤마 제거 후 숫자만 허용
  const handleBeginningInputChange = (e) => {
    let v = e.target.value;
    // 콤마 제거
    v = v.replace(/,/g, '');
    // 빈 문자열 허용 (사용자가 모두 지울 수 있도록)
    if (v === '') {
      setBeginningRaw('');
      return;
    }
    // 정수만 허용: 필요 시 소수점/음수 허용 로직 추가
    if (/^\d+$/.test(v)) {
      // 불필요한 앞 0 제거하려면: v = String(Number(v))
      setBeginningRaw(v);
    }
    // 숫자가 아닌 입력은 무시
  };

  // 5) 포커스/블러 핸들러: 포커스 시 편집 모드, 블러 시 포맷 모드
  const handleFocus = () => {
    setIsEditing(true);
  };
  const handleBlur = () => {
    setIsEditing(false);
  };

  // 6) 시작값 저장: raw에서 숫자로 변환 후 서버 전송
  const handleBeginningSave = async () => {
    try {
      const raw = beginningRaw.replace(/,/g, '');
      const num = Number(raw);
      if (isNaN(num)) {
        alert('유효한 숫자를 입력하세요.');
        return;
      }
      await axios.post(
        `/api/admin/account/ap/beginning`,
        { amount: num },
        { withCredentials: true }
      );
      // 저장 후 재조회
      await fetchData(year);
      alert('초기값 저장 완료 및 화면 반영되었습니다.');
    } catch (err) {
      alert('저장 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  // 7) PDF/CSV/뒤로가기 핸들러
  const handlePdf = () => {
    const url = `/api/admin/account/ap/pdf?year=${year}`;
    window.open(url, '_blank');
  };
  const handleExportCSV = () => {
    alert('CSV 기능 준비 중');
  };

  // 8) 연도 옵션 생성
  const yearOptions = Array.from({ length: 10 }).map((_, i) => {
    const y = new Date().getFullYear() - i;
    return (
      <option key={y} value={y}>
        {y}
      </option>
    );
  });

  return (
    <div className={styles.page}>
      {/* 1) 초기값 입력 영역 */}
      <h2>AP Beginning Amount</h2>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '30%' }}>
        <input
          type="text"
          // 편집 중이면 raw, 아니면 포맷값
          value={isEditing ? beginningRaw : getDisplayValue()}
          onChange={handleBeginningInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="초기값 입력"
          style={{ width: '8rem', boxSizing: 'border-box' }}
          aria-label="초기값 입력"
        />
        <button className={styles.lightPink} onClick={handleBeginningSave}>
          저장
        </button>
      </div>

      {/* 2) AP Table 툴바: 연도 선택 + 액션 버튼 */}
      <h2>AP Table</h2>
      <div className={`${styles.formRow} ${styles.small}`}>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ width: '8rem', boxSizing: 'border-box' }}
        >
          {yearOptions}
        </select>
        <button className={styles.lightBlue} onClick={handlePdf}>
          PDF 보기
        </button>
        <button className={styles.lightBlue} onClick={handleExportCSV}>
          CSV 출력
        </button>
        <button className={styles.lightPink} onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>

      {/* 3) 테이블 영역 */}
      <div className={styles.list}>
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
            {Array.isArray(monthlyData) && monthlyData.length > 0 ? (
              monthlyData.map((m, idx) => (
                <tr key={idx}>
                  <td className={styles.leftAlign}>
                    {m.month_name} ({m.end_date})
                  </td>
                  <td>{Number(m.pur_sum).toLocaleString()}</td>
                  <td>{Number(m.pay_sum).toLocaleString()}</td>
                  <td>{Number(m.ap_sum).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountApPage;
