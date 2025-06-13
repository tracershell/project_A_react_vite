import React, { useState, useRef, useEffect } from 'react';
import styles from '../PayrollDocPage.module.css';
import axios from 'axios';

const PayrollDeductionAdd = ({ uploadedFile, onUpload, onDelete }) => {
  const [form, setForm] = useState({
    paydate: '',
    name: 'Jonathan Gutierrez',
    ckno: '',
    amount: '$25.00',
    filename: uploadedFile?.filename || '',
  });
  const [file, setFile] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, filename: uploadedFile?.filename || '' }));
  }, [uploadedFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }
    await onUpload(file);
    setFile(null);
    if (inputRefs.current[0]) inputRefs.current[0].value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/admin/payroll/payrolldoc/deduction/viewpdf', {
        params: form,
        responseType: 'blob',
        withCredentials: true,
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating Payroll Deduction PDF:', err);
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
      <h2>Payroll Deduction Add</h2>
      <div className={styles.uploadSection}>
        <form onSubmit={handleUpload} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            ref={(el) => (inputRefs.current[0] = el)}
            required
          />
          <button type="submit">📤 Upload</button>
        </form>
        <span>{uploadedFile?.originalname || ''}</span>
        <button
          type="button"
          onClick={onDelete}
          disabled={!uploadedFile}
          className={styles.btnDelete}
        >
          Delete
        </button>
      </div>
      <form onSubmit={handleSubmit} className={styles.row}>
        <input type="hidden" name="filename" value={form.filename} />
        <div className={styles.formGroup}>
          <label>Date:</label>
          <input
            type="date"
            name="paydate"
            value={form.paydate}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[1] = el)}
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
            onKeyDown={(e) => handleKeyDown(e, 2)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[2] = el)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Check No:</label>
          <input
            type="text"
            name="ckno"
            placeholder="Check No"
            value={form.ckno}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 3)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[3] = el)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Amount:</label>
          <input
            type="text"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 4)}
            onFocus={handleFocus}
            ref={(el) => (inputRefs.current[4] = el)}
          />
        </div>
        <button type="submit">📄 View PDF</button>
      </form>
    </div>
  );
};

export default PayrollDeductionAdd;