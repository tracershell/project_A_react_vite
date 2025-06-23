// 📁 client/src/pages/admin/account/AccountApArPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AccountApArPage.module.css';
import { useNavigate } from 'react-router-dom';

const AccountApArPage = () => {
  const [list, setList] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [user, setUser] = useState(null); // 로그인 사용자 정보
  const navigate = useNavigate();

  const handleGoAp = () => {
    navigate('/admin/account/ap');  // 기존 창 내에서 AP 페이지로 이동
  };

  const handleGoAr = () => {
    navigate('/admin/account/ar');  // 기존 창 내에서 AR 페이지로 이동
  };

  // 오늘 날짜의 월 첫째/마지막 날짜 계산 (YYYY-MM-DD)
  const getThisMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    return { firstDay, lastDay };
  };

  // 1) 컴포넌트 마운트 시: 인증 확인 후 초기 데이터 로드
  useEffect(() => {
    const { firstDay, lastDay } = getThisMonthRange();
    // 1-1) 인증 확인
    axios
      .get('/api/auth/me', { withCredentials: true })
      .then((res) => {
        setUser(res.data); // 필요 시 사용자 정보 저장
        // 인증됨: 초기 start/end 설정 및 데이터 조회
        setStart(firstDay);
        setEnd(lastDay);
        fetchList(firstDay, lastDay);
      })
      .catch((err) => {
        console.warn('인증되지 않음:', err.response?.status);
        // 로그인 페이지로 리다이렉트
        navigate('/login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) list 조회 함수: start, end 날짜 문자열(YYYY-MM-DD) 전달
  const fetchList = async (s, e) => {
    try {
      const response = await axios.get('/api/admin/account/apar', {
        params: { start: s, end: e },
        withCredentials: true,
      });
      const data = response.data;
      console.log('AP/AR API 응답:', data);
      if (Array.isArray(data)) {
        setList(data);
      } else {
        console.warn('AP/AR API가 배열을 반환하지 않음:', data);
        setList([]);
      }
    } catch (err) {
      console.error('AP/AR 불러오기 오류:', err.response || err.message);
      // 인증 오류일 경우 리다이렉트
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setList([]); // 오류 시 빈 배열로 설정
    }
  };

  // 3) 검색 버튼 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    if (!start || !end) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }
    if (start > end) {
      alert('시작일이 종료일보다 클 수 없습니다.');
      return;
    }
    console.log('🔍 검색 실행:', start, end); // 👉 콘솔 확인용
    fetchList(start, end);
  };

  // 4) AP Page, AR Page 버튼 핸들러 (라우트 경로는 실제 경로에 맞춰 조정)
  const goToAPPage = () => {
    navigate('/admin/account/apage');
  };
  const goToARPage = () => {
    navigate('/admin/account/arpage');
  };

  return (
    <div className={styles.page}>
      <h2>Pay History for AP / AR</h2>

      {/* 검색 폼: start, end, AP Page, AR Page */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <form className={`${styles.formRow} ${styles.small}`} onSubmit={handleSearch} style={{ width: '50%' }}>
  <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
  <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
  <button type="submit">검색</button>
  <button type="button" className={styles.lightBlue} onClick={() => {
    if (!start || !end) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }
    const url = `/api/admin/account/apar/pdf?start=${start}&end=${end}`;
    window.open(url, '_blank');
  }}>
    PDF 보기
  </button>
  <button type="button" className={styles.lightPink} onClick={handleGoAp}>AP Page</button>
  <button type="button" className={styles.lightPink} onClick={handleGoAr}>AR Page</button>
</form>
</div>


      {/* 결과 테이블 */}
      <div className={styles.list}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th>PO No</th>
              <th>PO Date</th>
              <th>PO Amount (USD)</th>
              <th>Deposit Date</th>
              <th>Deposit (USD)</th>
              <th>Balance Date</th>
              <th>Balance (USD)</th>
              <th>Remain Amount</th> {/* ✅ 추가 */}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(list) && list.length > 0 ? (
              list.map((r, i) => {
                const poAmount = Number(r.po_amount_usd || 0);
                const dpAmount = Number(r.dp_amount_usd || 0);
                const bpAmount = Number(r.bp_amount_usd || 0);
                const remainAmount = poAmount - (dpAmount + bpAmount);

                return (
                  <tr key={i}>
                    <td>{r.po_no}</td>
                    <td>{r.po_date?.slice(0, 10) || '-'}</td>
                    <td>{poAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{r.dp_date?.slice(0, 10) || '-'}</td>
                    <td>{dpAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{r.bp_date?.slice(0, 10) || '-'}</td>
                    <td>{bpAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ color: 'lightblue' }}>
                      {remainAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>
                  {Array.isArray(list)
                    ? '검색 결과가 없습니다.'
                    : '데이터를 불러오는 중 오류가 발생했습니다.'}
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default AccountApArPage;
