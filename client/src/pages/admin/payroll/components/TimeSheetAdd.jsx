import React, { useState, useRef, useEffect } from 'react';
import styles from '../PayrollDocPage.module.css';
import axios from 'axios';

const TimeSheetAdd = () => {
  const [form, setForm] = useState({
    regular: '',
    overtime: '0:00',
    doubletime: '0:00',
    lunchcount: '0',
    comment: '',
  });
  const inputRefs = useRef([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/admin/payroll/payrolldoc/timeadd/viewpdf', {
        params: form,
        responseType: 'blob',
        withCredentials: true,
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating Time Sheet PDF:', err);
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
      <h2>Time Sheet Add</h2>
      <form onSubmit={handleSubmit} className={styles.row}>
        <div className={styles.formGroup}>
          <label>Regular Time:</label>
          <input
            type="text"
            name="regular"
            placeholder="hh:mm"
            value={form.regular}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[0] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Over Time:</label>
          <input
            type="text"
            name="overtime"
            placeholder="hh:mm"
            value={form.overtime}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[1] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Double Time:</label>
          <input
            type="text"
            name="doubletime"
            placeholder="hh:mm"
            value={form.doubletime}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 2)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[2] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Lunch count:</label>
          <input
            type="number"
            name="lunchcount"
            min="0"
            value={form.lunchcount}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 3)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[3] = el)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Comment</label>
          <input
            type="text"
            name="comment"
            placeholder="Comment"
            value={form.comment}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 4)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[4] = el)}
          />
        </div>
        <button type="submit">📄 PDF 보기</button>
      </form>
    </div>
  );
};

export default TimeSheetAdd;