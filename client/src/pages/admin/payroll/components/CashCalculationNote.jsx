import React, { useState, useRef } from 'react';
import styles from '../PayrollDocPage.module.css';
import axios from 'axios';

const CashCalculationNote = () => {
  const [form, setForm] = useState({
    paydate: '',
    name: 'Edgar',
    rtime: '',
    otime: '0:00',
    rate: '3.00',
  });
  const inputRefs = useRef([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/admin/payroll/payrolldoc/cashpay/viewpdf', {
        params: form,
        responseType: 'blob',
        withCredentials: true,
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating Cash Calculation PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        setTimeout(() => nextInput.select(), 10);
      }
    }
  };

  const handleFocus = (e) => {
    setTimeout(() => e.target.select(), 10);
  };

  return (
    <div className={styles.section}>
      <h2>Cash Calculation Note</h2>
      <form onSubmit={handleSubmit} className={styles.row}>
        <div className={styles.formGroup}>
          <label>Date:</label>
          <input
            type="date"
            name="paydate"
            value={form.paydate}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[0] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[1] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Regular Time:</label>
          <input
            type="text"
            name="rtime"
            placeholder="hh:mm"
            value={form.rtime}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 2)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[2] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Over Time:</label>
          <input
            type="text"
            name="otime"
            placeholder="hh:mm"
            value={form.otime}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 3)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[3] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Cash Rate:</label>
          <input
            type="number"
            name="rate"
            value={form.rate}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 4)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[4] = el)}
            required
          />
        </div>
        <button type="submit">📄 PDF 보기</button>
      </form>
    </div>
  );
};

export default CashCalculationNote;