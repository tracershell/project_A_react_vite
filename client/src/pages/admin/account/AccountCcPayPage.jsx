import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import styles from './AccountCcPayPage.module.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api/admin/account/accountccpaypage',
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('authToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const AccountCcPayPage = () => {
  const [form, setForm] = useState({
    id: '',
    pdate: '',
    ptype: '',
    ptname: '',
    pamount: '',
    provider: '',
    holder: '',
    anumber: '',
    hnumber: '',
    udate: '',
    aitem: '',
    icode: '',
    inote: '',
    uamount: '',
    uremark: '',
  });

  const [records, setRecords] = useState([]);
  const [holders, setHolders] = useState([]);
  const [items, setItems] = useState([]);
  const [fixed, setFixed] = useState({ pdate: '', ptype: '', ptname: '', pamount: '', provider: '', holder: '', udate: '', aitem: '' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchMeta();
    fetchRecords();
  }, []);


  const fetchRecords = async () => {
  try {
    const { data } = await api.get('/list');
    setRecords(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('📛 records API 오류:', err);
    setRecords([]);
  }
};

  const handleChange = e => {
  const { name, value } = e.target;

  // ✅ ① holder 선택 처리
  if (name === 'holder') {
    const [holder, provider] = value.split('|');
    const h = holders.find(x => x.holder === holder && x.provider === provider);
    setForm(prev => ({
      ...prev,
      holder,
      provider,
      anumber: h?.anumber || '',
      hnumber: h?.hnumber || '',
    }));
    if (!fixedOwner.holder) {
  setFixedOwner({
    holder,
    provider,
    anumber: h?.anumber || '',
    hnumber: h?.hnumber || '',
    udate: form.udate || '',
  });
}
  }

  // ✅ ② aitem 선택 처리
  else if (name === 'aitem') {
    const item = items.find(i => i.aitem === value);
    setForm(prev => ({
      ...prev,
      aitem: value,
      icode: item?.icode || '',
      inote: item?.inote || '',
    }));
  }

  // ✅ ③ 일반 필드 입력 처리
  else {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // ✅ ④ 아래 코드 블록을 이 위치에 추가하세요 — 입력값 고정 처리
  // -----------------------------------------------------------
  if (['pdate', 'ptype', 'ptname', 'pamount'].includes(name)) {
  setFixedPay(prev => ({ ...prev, [name]: value }));
}
if (['holder', 'provider', 'anumber', 'hnumber', 'udate'].includes(name)) {
  setFixedOwner(prev => ({ ...prev, [name]: value }));
}

  };

  

const handleSubmit = async () => {
  // ✅ 필수 입력값 검사 (ptname 제외)
  if (!form.pdate) return alert('결제일을 입력하세요.');
  if (!form.ptype) return alert('결제 유형을 선택하세요.');
  if (!form.pamount) return alert('결제 금액을 입력하세요.');
  if (!form.holder) return alert('소유자를 선택하세요.');
  if (!form.uamount) return alert('사용금액을 입력하세요.');

  try {
    const cleanForm = {
      ...form,
      pdate: form.pdate?.slice(0, 10) || '',
      udate: form.udate?.slice(0, 10) || '',
    };

    await api.post('/add', cleanForm);
    alert('입력 완료');

    setForm(prev => ({
  id: '',
  pdate: fixedPay.pdate || prev.pdate,
  ptype: fixedPay.ptype || prev.ptype,
  ptname: fixedPay.ptname || prev.ptname,
  pamount: fixedPay.pamount || prev.pamount,

  holder: fixedOwner.holder || prev.holder,
  provider: fixedOwner.provider || prev.provider,
  anumber: fixedOwner.anumber || prev.anumber,
  hnumber: fixedOwner.hnumber || prev.hnumber,
  udate: fixedOwner.udate || prev.udate,

  aitem: '',
  icode: '',
  inote: '',
  uamount: '',
  uremark: '',
}));

    fetchRecords();
  } catch {
    alert('입력 실패');
  }
};


  const handleSelect = (r) => {
  setForm({
    ...r,
    id: Number(r.id), // ✅ 반드시 숫자로 명시적 변환
  });
};



  const handleUpdate = async () => {
  try {
    const cleanForm = {
      ...form,
      pdate: form.pdate?.slice(0, 10) || '',
      udate: form.udate?.slice(0, 10) || '',
    };

    await api.post('/update', cleanForm);
    alert('수정 완료');
    fetchRecords();
  } catch {
    alert('수정 실패');
  }
};

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await api.post('/delete', { id: form.id });
      alert('삭제 완료');
      fetchRecords();
    } catch {
      alert('삭제 실패');
    }
  };

  const resetForm = () => {
    setForm(f => ({ id: '', ...fixed, holder: '', anumber: '', hnumber: '', uamount: '', uremark: '', aitem: '', icode: '', inote: '' }));
  };

  const fetchMeta = async () => {
  try {
    const [holdersRes, itemsRes] = await Promise.all([
      api.get('/holders'),
      api.get('/items'),
    ]);
    setHolders(Array.isArray(holdersRes.data) ? holdersRes.data : []);
    setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
  } catch (err) {
    console.error('📛 holders/items API 오류:', err);
    setHolders([]);
    setItems([]);
  }
};

const [fixedPay, setFixedPay] = useState({
  pdate: '', ptype: '', ptname: '', pamount: ''
});
const [fixedOwner, setFixedOwner] = useState({
  holder: '', provider: '', anumber: '', hnumber: '', udate: ''
});

// ✅ 결제일과 카드번호 기준으로 records 필터링
const filteredRecords = records.filter(
  r => r.pdate?.slice(0, 10) === form.pdate?.slice(0, 10) && r.anumber === form.anumber
);

// ✅ uamount 필드 합계 계산
const totalUamount = filteredRecords.reduce((sum, r) => sum + parseFloat(r.uamount || 0), 0);

// ✅ 결제 정보 초기화 함수
const resetFixedPay = () => {
  setFixedPay({});
  setForm(prev => ({
    ...prev,
    pdate: '',
    ptype: '',
    ptname: '',
    pamount: '',
  }));
};

// ✅ 소유자 정보 초기화 함수
const resetFixedOwner = () => {
  setFixedOwner({});
  setForm(prev => ({
    ...prev,
    holder: '',
    provider: '',
    anumber: '',
    hnumber: '',
    udate: '',
  }));
};



  return (
    <div className={styles.page}>
      <h2>Credit Card Pay Input</h2>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '50%' }}>
        <label>결제일</label>
        <input type="date" name="pdate" value={form.pdate} onChange={handleChange} />
        <label>유형</label>
        <select name="ptype" value={form.ptype} onChange={handleChange}>
          <option value="">선택</option>
          <option value="Check">Check</option>
          <option value="ACH">ACH</option>
        </select>
        <label>Check번호</label>
        <input name="ptname" value={form.ptname} onChange={handleChange} />
        <label>결제금액</label>
        <input name="pamount" value={form.pamount} onChange={handleChange} />
        <button className={styles.lightBlue} onClick={resetFixedPay}>
  결제 정보 초기화
</button>
      </div>
      </div>

     <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className={`${styles.formRow} ${styles.small}`} style={{ width: '100%' }}>
        <label>소유자</label>
<select name="holder" value={`${form.holder}|${form.provider}`} onChange={handleChange}>
  <option value="">-- 선택 --</option>
  {Array.isArray(holders) && holders.map(h => (
    <option key={h.id} value={`${h.holder}|${h.provider}`}>
      {h.holder} ({h.provider})
    </option>
  ))}
</select>

<label>카드사</label>
<input name="provider" value={form.provider} readOnly />

<label>카드번호</label>
<input name="anumber" value={form.anumber} readOnly />

<label>고유번호</label>
<input name="hnumber" value={form.hnumber} readOnly />

        <label>사용일</label>
        <input type="date" name="udate" value={form.udate} onChange={handleChange} />

        <label>항목</label>
<select name="aitem" value={form.aitem} onChange={handleChange}>
  <option value="">-- 선택 --</option>
  {Array.isArray(items) && items.map(i => (
    <option key={i.id} value={i.aitem}>{i.aitem}</option>
  ))}
</select>
{/* ✅ 항목 선택 시 자동 채워지는 코드 및 설명 표시 */}
<label>코드</label>
<input name="icode" value={form.icode} readOnly />

<label>설명</label>
<input name="inote" value={form.inote} readOnly />

        <label>사용금액</label>
        <input name="uamount" value={form.uamount} onChange={handleChange} />

        <button className={styles.submitBtn} onClick={handleSubmit}>입력</button>
        <button className={styles.lightBlue} onClick={handleUpdate}>수정</button>
        <button className={styles.lightBlue} onClick={handleDelete}>삭제</button>
        <button className={styles.lightBlue} onClick={resetFixedOwner}>
  소유자 정보 초기화
</button>

        <button className={styles.lightPink} onClick={() => navigate(-1)}>되돌아가기</button>
      </div>
</div>
      {/* 목록 */}
      <h2>Credit Card Input List</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.payTable}>
          <thead>
            <tr>
              <th>pdate</th><th>ptype</th><th>ptname</th><th>pamount</th>
              <th>provider</th><th>anumber</th><th>holder</th><th>udate</th>
              <th>aitem</th><th>icode</th><th>inote</th><th>uamount</th><th>uremark</th>
            </tr>
          </thead>
          <tbody>
  {filteredRecords.map(r => (
    <tr key={r.id} onClick={() => handleSelect(r)} style={{ cursor: 'pointer' }}>
      <td>{r.pdate?.slice(0, 10)}</td>
      <td>{r.ptype}</td>
      <td>{r.ptname}</td>
      <td>{r.pamount}</td>
      <td>{r.provider}</td>
      <td>{r.anumber}</td>
      <td>{r.holder}</td>
      <td>{r.udate?.slice(0, 10)}</td>
      <td>{r.aitem}</td>
      <td>{r.icode}</td>
      <td>{r.inote}</td>
      <td>{r.uamount}</td>
      <td>{r.uremark}</td>
    </tr>
  ))}
</tbody>

        </table>
        <div style={{ marginTop: '1rem', fontWeight: 'bold', color: 'red' }}>
  사용금액 합계: {totalUamount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
</div>

      </div>
    </div>
  );
};

export default AccountCcPayPage;
