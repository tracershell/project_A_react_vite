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
    eid: '', name: '', jcode: '', jtitle: '', work1: '',
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
        work1: emp.work1 || ''
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const calculateTotals = () => {
    const toNum = v => parseFloat(v.replace(/,/g, '')) || 0;
    const gross = toNum(form.rtime) + toNum(form.otime) + toNum(form.dtime);
    const tax = toNum(form.fw) + toNum(form.sse) + toNum(form.me)
      + toNum(form.caw) + toNum(form.cade);
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
    await api.post('/add', form);
    fetchPaylist(form.pdate);
  };
  const handleSelect = async () => {
    if (!form.ckno) return alert('Check No. 입력');
    const { data } = await api.get(`/select?ckno=${encodeURIComponent(form.ckno)}`);
    if (!data.success) return alert(data.message);
    const rec = data.data;
    setForm({
      ...form,
      ...rec,
      pdate: rec.pdate.slice(0, 10),
      ckno: rec.ckno
    });
  };
  const handleUpdate = async () => {
    await api.post('/update', form);
    fetchPaylist(form.pdate);
  };
  const handleDelete = async () => {
    if (!form.ckno) return alert('Check No. 입력');
    await api.post('/delete', { ckno: form.ckno });
    fetchPaylist(form.pdate);
    setForm(f => ({ ...f, ckno: '' }));
  };

  return (
    <div className={styles.page}>
      <h2>Pay List</h2>

      {/* ① 첫 번째 줄: 직원 + Reference 버튼만 */}
      <div className={`${styles.formRow} ${styles.small}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label>Name</label>
          <select name="name" value={form.name} onChange={handleChange}>
            <option value="">-- Select Employee --</option>
            {employees.map(e =>
              <option key={e.eid} value={e.name}>{e.name}</option>
            )}
          </select>
          <button className={styles.lightBlue} onClick={() => fetchPaylist(form.pdate)}>
            Reference
          </button>
        </div>
      </div>

      {/* ② 두 번째 줄: Pay Date 만 */}
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Pay Date</label>
        <input type="date" name="pdate"
          value={form.pdate} onChange={handleChange}
        />
      </div>


      {/* ========================== */}
      {/* 핵심 입력 줄 (그룹별 박스 처리) */}
      {/* ========================== */}
      <div className={`${styles.formRow} ${styles.small}`} style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
        {/* ┌────────────── 첫 번째 그룹 ──────────────┐ */}
        <div className={`${styles.groupBox} ${styles.groupCheck}`}>
          <label>Check No.</label>
          <input
            name="ckno"
            value={form.ckno}
            onChange={handleChange}
            ref={el => inputRefs.current[0] = el}
            onKeyDown={e => handleKeyDown(e, 0)}
          />
        </div>
        {/* └─────────────────────────────────────────┘ */}

        {/* ┌────────────── 두 번째 그룹 ──────────────┐ */}
        <div className={`${styles.groupBox} ${styles.groupTime}`}>
          <div className={styles.groupRow}>
            <div className={styles.itemWrapper}>
              <label>R.T</label>
              <input
                name="rtime"
                value={form.rtime}
                onChange={handleChange}
                ref={el => inputRefs.current[1] = el}
                onKeyDown={e => handleKeyDown(e, 1)}
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>O.T</label>
              <input
                name="otime"
                value={form.otime}
                onChange={handleChange}
                ref={el => inputRefs.current[2] = el}
                onKeyDown={e => handleKeyDown(e, 2)}
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>D.T</label>
              <input
                name="dtime"
                value={form.dtime}
                onChange={handleChange}
                ref={el => inputRefs.current[3] = el}
                onKeyDown={e => handleKeyDown(e, 3)}
              />
            </div>
          </div>
        </div>
        {/* └─────────────────────────────────────────┘ */}

        {/* ┌────────────── 세 번째 그룹 ──────────────┐ */}
        <div className={`${styles.groupBox} ${styles.groupTax1}`}>
          <div className={styles.groupRow}>
            <div className={styles.itemWrapper}>
              <label>FW</label>
              <input
                name="fw"
                value={form.fw}
                onChange={handleChange}
                ref={el => inputRefs.current[4] = el}
                onKeyDown={e => handleKeyDown(e, 4)}
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>SSE</label>
              <input
                name="sse"
                value={form.sse}
                onChange={handleChange}
                ref={el => inputRefs.current[5] = el}
                onKeyDown={e => handleKeyDown(e, 5)}
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>ME</label>
              <input
                name="me"
                value={form.me}
                onChange={handleChange}
                ref={el => inputRefs.current[6] = el}
                onKeyDown={e => handleKeyDown(e, 6)}
              />
            </div>
          </div>
        </div>
        {/* └─────────────────────────────────────────┘ */}

        {/* ┌────────────── 네 번째 그룹 ──────────────┐ */}
        <div className={`${styles.groupBox} ${styles.groupTax2}`}>
          <div className={styles.groupRow}>
            <div className={styles.itemWrapper}>
              <label>CA-W</label>
              <input
                name="caw"
                value={form.caw}
                onChange={handleChange}
                ref={el => inputRefs.current[7] = el}
                onKeyDown={e => handleKeyDown(e, 7)}
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>CA-de</label>
              <input
                name="cade"
                value={form.cade}
                onChange={handleChange}
                ref={el => inputRefs.current[8] = el}
                onKeyDown={e => handleKeyDown(e, 8)}
              />
            </div>
          </div>
        </div>
        {/* └─────────────────────────────────────────┘ */}

        {/* ┌────────────── 다섯 번째 그룹 ─────────────┐ */}
        <div className={`${styles.groupBox} ${styles.groupAdv}`}>
          <div className={styles.groupRow}>
            <div className={styles.itemWrapper}>
              <label>ADV.</label>
              <input
                name="adv"
                value={form.adv}
                onChange={handleChange}
                ref={el => inputRefs.current[9] = el}
                onKeyDown={e => handleKeyDown(e, 9)}
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>C.S</label>
              <input
                name="csp"
                value={form.csp}
                onChange={handleChange}
                ref={el => inputRefs.current[10] = el}
                onKeyDown={e => handleKeyDown(e, 10)}
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>D.D</label>
              <input
                name="dd"
                value={form.dd}
                onChange={handleChange}
                ref={el => inputRefs.current[11] = el}
                onKeyDown={e => handleKeyDown(e, 11)}
              />
            </div>
          </div>
        </div>
        {/* └─────────────────────────────────────────┘ */}

        {/* ┌────────────── 여섯 번째 그룹 (공백 영역) ──────────────┐ */}
        <div className={styles.groupBoxEmpty} />
        {/* └───────────────────────────────────────────────────────┘ */}

        {/* ┌────────────── 일곱 번째 그룹 ─────────────┐ */}
        <div className={`${styles.groupBox} ${styles.groupSummary}`}>
          <div className={styles.groupRow}>
            <div className={styles.itemWrapper}>
              <label>Gross</label>
              <input
                name="gross"
                value={form.gross}
                readOnly
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>Tax</label>
              <input
                name="tax"
                value={form.tax}
                readOnly
              />
            </div>
            <div className={styles.itemWrapper}>
              <label>Net</label>
              <input
                name="net"
                value={form.net}
                readOnly
              />
            </div>
          </div>
        </div>
        {/* └─────────────────────────────────────────┘ */}

        {/* ┌────────────── “입력” 버튼 ─────────────┐ */}
        <button className={styles.submitBtn} onClick={handleAdd}>
          입력
        </button>
        {/* └─────────────────────────────────────────┘ */}
      </div>





      {/* Remark + Work Info */}
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>Remark</label>
        <input name="remark" value={form.remark} onChange={handleChange} />
        <span>W.code: {form.jcode}</span>
        <span>W.title: {form.jtitle}</span>
        <span>W.location: {form.work1}</span>
      </div>

      {/* 하단 리스트 */}
      <h2>Pay Records (Selected Pay Date)</h2>
      <div className={`${styles.formRow} ${styles.small}`}>
        <label>날짜 선택</label>
        <select
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        >
          <option value="">:: Select Pay Date ::</option>
          {dates.map(d =>
            <option key={d.pdate} value={d.pdate}>
              {d.pdate}
            </option>
          )}
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
            {paylist.length === 0
              ? <tr><td colSpan="19">선택한 날짜에 대한 기록이 없습니다.</td></tr>
              : paylist.map(r => (
                <tr key={r.ckno}>
                  <td>{r.pdate}</td><td>{r.eid}</td><td>{r.name}</td><td>{r.ckno}</td>
                  <td>{r.rtime}</td><td>{r.otime}</td><td>{r.dtime}</td>
                  <td>{r.fw}</td><td>{r.sse}</td><td>{r.me}</td>
                  <td>{r.caw}</td><td>{r.cade}</td><td>{r.adv}</td>
                  <td>{r.csp}</td><td>{r.dd}</td><td>{r.gross}</td>
                  <td>{r.tax}</td><td>{r.net}</td><td>{r.remark}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollTaxPage;
