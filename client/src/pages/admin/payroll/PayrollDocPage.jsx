// client/src/pages/admin/payroll/PayrollDocPage.jsx

import React, { useState, useRef } from 'react';
import styles from './PayrollDocPage.module.css';
import axios from 'axios';

const PayrollDocPage = () => {
  const [form, setForm] = useState({
    rhour: '', rmin: '', ohour: '', omin: '', dhour: '', dmin: '',
    ltimes: '', comment: '',
    cdate: '', cname: 'Edgar', crate: '3.00',
    crhour: '', crmin: '', cohour: '', comin: ''
  });

  const inputRefs = useRef([]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputRefs.current[idx + 1]) {
        inputRefs.current[idx + 1].focus();
      }
    }
  };

  const handleViewPDF = async () => {
    const query = new URLSearchParams(form).toString();
    window.open(`/api/admin/payroll/payrolldoc/timesheetpdf?${query}`, '_blank');
  };

  const handleCashPDF = async () => {
    const query = new URLSearchParams(form).toString();
    window.open(`/api/admin/payroll/payrolldoc/cashpaypdf?${query}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <h2>Time Sheet Add</h2>
      <div className={styles.formRow}>
        <label>R Time:</label>
        <input ref={el => inputRefs.current[0] = el} name="rhour" placeholder="hh" value={form.rhour} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 0)} />
        <input ref={el => inputRefs.current[1] = el} name="rmin" placeholder="mm" value={form.rmin} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 1)} />

        <label>O Time:</label>
        <input ref={el => inputRefs.current[2] = el} name="ohour" placeholder="hh" value={form.ohour} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 2)} />
        <input ref={el => inputRefs.current[3] = el} name="omin" placeholder="mm" value={form.omin} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 3)} />

        <label>D Time:</label>
        <input ref={el => inputRefs.current[4] = el} name="dhour" placeholder="hh" value={form.dhour} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 4)} />
        <input ref={el => inputRefs.current[5] = el} name="dmin" placeholder="mm" value={form.dmin} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 5)} />

        <label>Lunch Count:</label>
        <input ref={el => inputRefs.current[6] = el} name="ltimes" placeholder="횟수" value={form.ltimes} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 6)} />

        <label>Comment:</label>
        <input
          ref={el => inputRefs.current[7] = el}
          name="comment"
          placeholder="메모"
          value={form.comment}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(e, 7)}
          className={styles.commentInput}
        />
        <button onClick={handleViewPDF}>PDF 보기</button>
      </div>

      <h2>Cash Calculation Note</h2>
      <div className={styles.formRow}>
        <label>Date:</label>
        <input ref={el => inputRefs.current[8] = el} name="cdate" type="date" value={form.cdate} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 8)} />

        <label>Name:</label>
        <input ref={el => inputRefs.current[9] = el} name="cname" value={form.cname} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 9)} />

        <label>R Time:</label>
        <input ref={el => inputRefs.current[10] = el} name="crhour" placeholder="hh" value={form.crhour} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 10)} />
        <input ref={el => inputRefs.current[11] = el} name="crmin" placeholder="mm" value={form.crmin} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 11)} />

        <label>O Time:</label>
        <input ref={el => inputRefs.current[12] = el} name="cohour" placeholder="hh" value={form.cohour} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 12)} />
        <input ref={el => inputRefs.current[13] = el} name="comin" placeholder="mm" value={form.comin} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 13)} />

        <label>Cash Rate:</label>
        <input ref={el => inputRefs.current[14] = el} name="crate" placeholder="$" value={form.crate} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 14)} />

        <button onClick={handleCashPDF}>PDF 보기</button>
      </div>
    </div>
  );
};

export default PayrollDocPage;
