import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from './PayrollTaxPage.module.css';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api/admin/payroll/payrolltax',
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('authToken');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const PayrollTaxPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [dates, setDates] = useState([]);
  const [paylist, setPaylist] = useState([]);
  const [form, setForm] = useState({
    eid: '', name: '', jcode: '', jtitle: '', workl: '',
    pdate: '', ckno: '', rtime: '', otime: '', dtime: '',
    fw: '', sse: '', me: '', caw: '', cade: '',
    adv: '', csp: '', dd: '', gross: '', tax: '', net: '', remark: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    fetchEmployees();
    fetchDates();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchPaylist(selectedDate);
    else setPaylist([]);
  }, [selectedDate]);

  useEffect(() => calculateTotals(), [
    form.rtime, form.otime, form.dtime,
    form.fw, form.sse, form.me, form.caw, form.cade
  ]);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch { }
  };
  const fetchDates = async () => {
    try {
      const { data } = await api.get('/dates');
      setDates(data);
    } catch { }
  };
  const fetchPaylist = async pdate => {
    try {
      const { data } = await api.get(`?pdate=${pdate}`);
      setPaylist(data);
    } catch { }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'name') {
      const emp = employees.find(x => x.name === value) || {};
      setForm(f => ({
        ...f,
        name: value,
        eid: emp.eid || '',
        jcode: emp.jcode || '',
        jtitle: emp.jtitle || '',
        workl: emp.workl || ''
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const calculateTotals = () => {
    const toNum = v => parseFloat(v.replace(/,/g, '')) || 0;
    const gross = toNum(form.rtime) + toNum(form.otime) + toNum(form.dtime);
    const tax = toNum(form.fw) + toNum(form.sse) + toNum(form.me) + toNum(form.caw) + toNum(form.cade);
    setForm(f => ({
      ...f,
      gross: gross.toFixed(2),
      tax: tax.toFixed(2),
      net: (gross - tax).toFixed(2)
    }));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = inputRefs.current[idx + 1];
      if (next) next.focus();
    }
  };

  const handleAdd = async () => {

      // name 또는 pdate가 비어 있으면 메시지 출력 후 함수 종료
  if (!form.name || !form.pdate) {
    alert('필수 자료 넣어 주세요');
    return;
  }

    try {
      await api.post('/add', form);
      alert('입력 완료');

      // Pay Date는 유지하고, 나머지는 초기화
      const pdate = form.pdate;
      setForm({
        eid: '', name: '', jcode: '', jtitle: '', workl: '',
        pdate: pdate, ckno: '', rtime: '', otime: '', dtime: '',
        fw: '', sse: '', me: '', caw: '', cade: '',
        adv: '', csp: '', dd: '', gross: '', tax: '', net: '', remark: ''
      });

      fetchPaylist(pdate);
    } catch (e) {
      // ✅ 이 조건문으로 정확히 분기
    if (e.response?.status === 400 && e.response?.data?.message) {
      alert(e.response.data.message);  // 👉 중복 메시지 출력
    } else {
      console.error(e);
      alert('저장 실패');
    }
  }
  };
  // ckno 기반 데이터 선택
  const handleSelect = () => {
    const target = paylist.find(p => p.ckno === form.ckno);
    if (!target) return alert('해당 Check No. 기록이 없습니다.');
    setForm({ ...target });
  };

  // ckno 기반 데이터 수정
  const handleUpdate = async () => {
    try {
      await api.post('/update', form);
      alert('수정되었습니다.');
      resetFormExceptDate(); // 날짜 제외하고 나머지 초기화
      fetchPaylist(form.pdate);
    } catch (e) {
      console.error(e);
      alert('수정 실패');
    }
  };

  // ckno 기반 데이터 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.post('/delete', { ckno: form.ckno });
      alert('삭제 완료');
      resetFormExceptDate();         // ✅ pdate 유지, 나머지 초기화
      fetchPaylist(form.pdate);      // ✅ 테이블 재조회
    } catch (e) {
      console.error(e);
      alert('삭제 실패');
    }
  };
  // 선택한 행의 데이터를 폼에 채워서 결국 수정 삭제 가능하게 하기 위헤
  const handleSelectRow = (record) => {
    setForm({ ...record });
  };

  // pdate 형식을 잘라내서 YYYY-MM-DD 형식으로 변환
  const cleanDate = date => {
    if (!date) return null;
    return date.split('T')[0]; // '2025-06-06T00:00:00.000Z' → '2025-06-06'
  };

  // 재사용 가능한 초기화 함수
  const resetFormExceptDate = () => {
    const pdate = form.pdate;
    setForm({
      eid: '', name: '', jcode: '', jtitle: '', workl: '',
      pdate, ckno: '', rtime: '', otime: '', dtime: '',
      fw: '', sse: '', me: '', caw: '', cade: '',
      adv: '', csp: '', dd: '', gross: '', tax: '', net: '', remark: ''
    });
  };

  return (
    <div className={styles.page}>
      <h2>Pay List</h2>

      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Name</label>
        <select name="name" value={form.name} onChange={handleChange} className={styles.nameSelect}>
          <option value="">-- Select Employee --</option>
          {employees.map(e =>
            <option key={e.eid} value={e.name}>{e.name}</option>
          )}
        </select>
        <button className={styles.lightBlue} onClick={() => fetchPaylist(form.pdate)}>Reference</button>
      </div>

      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Pay Date</label>
        <input type="date" name="pdate" value={form.pdate} onChange={handleChange} />
      </div>

      <div className={styles.formRow}>
        <div className={`${styles.groupBox} ${styles.groupCheck}`}>
          <label>Check No.</label>
          <input name="ckno" value={form.ckno} onChange={handleChange} ref={el => inputRefs.current[0] = el} onKeyDown={e => handleKeyDown(e, 0)} />
        </div>

        {/* Time Inputs */}
        <div className={`${styles.groupBox} ${styles.groupTime}`}>
          <div className={styles.groupRow}>
            {[['rtime', 'R.T'], ['otime', 'O.T'], ['dtime', 'D.T']].map(([key, label], i) => (
              <div className={styles.itemWrapper} key={key}>
                <label>{label}</label>
                <input name={key} value={form[key]} onChange={handleChange} ref={el => inputRefs.current[i + 1] = el} onKeyDown={e => handleKeyDown(e, i + 1)} />
              </div>
            ))}
          </div>
        </div>

        {/* Tax1 */}
        <div className={`${styles.groupBox} ${styles.groupTax1}`}>
          <div className={styles.groupRow}>
            {[['fw', 'FW'], ['sse', 'SSE'], ['me', 'ME']].map(([key, label], i) => (
              <div className={styles.itemWrapper} key={key}>
                <label>{label}</label>
                <input name={key} value={form[key]} onChange={handleChange} ref={el => inputRefs.current[i + 4] = el} onKeyDown={e => handleKeyDown(e, i + 4)} />
              </div>
            ))}
          </div>
        </div>

        {/* Tax2 */}
        <div className={`${styles.groupBox} ${styles.groupTax2}`}>
          <div className={styles.groupRow}>
            {[['caw', 'CA-W'], ['cade', 'CA-de']].map(([key, label], i) => (
              <div className={styles.itemWrapper} key={key}>
                <label>{label}</label>
                <input name={key} value={form[key]} onChange={handleChange} ref={el => inputRefs.current[i + 7] = el} onKeyDown={e => handleKeyDown(e, i + 7)} />
              </div>
            ))}
          </div>
        </div>

        {/* Adv */}
        <div className={`${styles.groupBox} ${styles.groupAdv}`}>
          <div className={styles.groupRow}>
            {[['adv', 'ADV.'], ['csp', 'C.S'], ['dd', 'D.D']].map(([key, label], i) => (
              <div className={styles.itemWrapper} key={key}>
                <label>{label}</label>
                <input name={key} value={form[key]} onChange={handleChange} ref={el => inputRefs.current[i + 9] = el} onKeyDown={e => handleKeyDown(e, i + 9)} />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className={`${styles.groupBox} ${styles.groupSummary}`}>
          <div className={styles.groupRow}>
            {[['gross', 'Gross'], ['tax', 'Tax'], ['net', 'Net']].map(([key, label]) => (
              <div className={styles.itemWrapper} key={key}>
                <label>{label}</label>
                <input name={key} value={form[key]} readOnly />
              </div>
            ))}
          </div>
        </div>

        <button className={styles.submitBtn} onClick={handleAdd}>입력</button>
        <button className={styles.lightBlue} onClick={resetFormExceptDate}>초기화</button>
      </div>

      {/* Remark + Work Info */}
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Remark</label>
        <input name="remark" value={form.remark} onChange={handleChange} className={styles.remarkInput} />
        <span className={styles.workLabel}>W.code:</span>
        <span className={styles.workValue}>{form.jcode}</span>
        <span className={styles.workLabel}>W.title:</span>
        <span className={styles.workValue}>{form.jtitle}</span>
        <span className={styles.workLabel}>W.location:</span>
        <span className={styles.workValue}>{form.workl}</span>
      </div>


      {/* ✅ Check No. 선택/수정/삭제 영역 추가 */}
      <div className={`${styles.formRow} ${styles.small}`}>
        <label style={{ minWidth: '6rem' }}>Check No.</label>
        <input name="ckno" value={form.ckno} onChange={handleChange} style={{ width: '150px' }} />
        <button className={styles.lightBlue} onClick={handleSelect}>선택</button>
        <button className={styles.lightBlue} onClick={handleUpdate}>수정</button>
        <button className={styles.lightBlue} onClick={handleDelete}>삭제</button>
      </div>

      <h2>Pay Records (Selected Pay Date)</h2>
      <div className={`${styles.formRow} ${styles.small}`}>
        <label style={{ minWidth: '4rem' }}>날짜 선택</label>
        <select
          className={styles.dateSelect}
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        >
          <option value="">:: Select Pay Date ::</option>
          {dates.map(d => (
            <option key={d.pdate} value={d.pdate.split('T')[0]}>
              {d.pdate.split('T')[0]}
            </option>
          ))}
        </select>

      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.payTable}>
          <thead>
            <tr>
              {['Pay Date', 'EID', 'Name', 'Check No', 'R.T', 'O.T', 'D.T', 'FW', 'SSE', 'ME', 'CA-W', 'CA-de', 'ADV.', 'C.S', 'D.D', 'Gross', 'Tax', 'Net', 'Remark']
                .map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {paylist.length === 0 ? (
              <tr><td colSpan="19">선택한 날짜에 대한 기록이 없습니다.</td></tr>
            ) : (
              paylist.map(r => (
                <tr key={r.ckno} onClick={() => handleSelectRow(r)} style={{ cursor: 'pointer' }}>
                  <td>{r.pdate}</td><td>{r.eid}</td><td>{r.name}</td><td>{r.ckno}</td>
                  <td>{r.rtime}</td><td>{r.otime}</td><td>{r.dtime}</td>
                  <td>{r.fw}</td><td>{r.sse}</td><td>{r.me}</td>
                  <td>{r.caw}</td><td>{r.cade}</td><td>{r.adv}</td>
                  <td>{r.csp}</td><td>{r.dd}</td><td>{r.gross}</td>
                  <td>{r.tax}</td><td>{r.net}</td><td>{r.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollTaxPage;