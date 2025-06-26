// client/src/pages/admin/payroll/PayrollDocPage.jsx

import React, { useEffect, useState, useRef } from 'react';
import styles from './PayrollDocPage.module.css';
import axios from 'axios';




const PayrollDocPage = () => {
  const [form, setForm] = useState({
    rhour: '', rmin: '', ohour: '', omin: '', dhour: '', dmin: '',
    ltimes: '', comment: '',
    cdate: '', cname: 'Edgar', crate: '3.00',
    crhour: '', crmin: '', cohour: '', comin: ''
  });

  const [childspFile, setChildspFile] = useState(null);
  const [childspFilename, setChildspFilename] = useState('');
  const [childspPreviewUrl, setChildspPreviewUrl] = useState('');
  const inputRefs = useRef([]);
  const [deductionFile, setDeductionFile] = useState(null);
  const [deductionFilename, setDeductionFilename] = useState('');

  useEffect(() => {
    const fetchChildspInfo = async () => {
      try {
        const res = await axios.get('/api/admin/payroll/payrolldoc/childsp-info');
        const filename = res.data.filename;
        if (filename) {
          setChildspFilename(filename);
          setChildspPreviewUrl(`/uploads/payroll/pdoc_upload/${filename}`);
        }
      } catch (err) {
        console.error('초기 파일 불러오기 실패:', err);
      }
    };
    fetchChildspInfo();

    const fetchDeductionInfo = async () => {
      try {
        const res = await axios.get('/api/admin/payroll/payrolldoc/deduction-info');
        const filename = res.data.filename;
        if (filename) setDeductionFilename(filename);
      } catch (err) {
        console.error('초기 deduction 파일 불러오기 실패:', err);
      }
    };
    fetchDeductionInfo();

  }, []);



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

  // -----------------------------


  const handleChildspPDF = () => {
    const params = new URLSearchParams({
      cs_date: form.cs_date || '',
      cs_name: form.cs_name || 'Jonathan Gutierrez',
      cs_checkno: form.cs_checkno || '',
      cs_amount: form.cs_amount || '50.01',
      filename: childspFilename
    }).toString();
    window.open(`/api/admin/payroll/payrolldoc/childsp-pdf?${params}`, '_blank');
  };

  const handleChildspUpload = async () => {
    if (!childspFile) return alert('파일을 선택하세요.');
    const formData = new FormData();
    formData.append('file', childspFile);
    try {
      const res = await axios.post('/api/admin/payroll/payrolldoc/upload-childsp', formData);
      const filename = res.data.filename;
      setChildspFilename(filename);
      setChildspPreviewUrl(`/uploads/payroll/pdoc_upload/${filename}`);  // 🔹 미리보기용 경로 설정
      alert('✅ 업로드 성공');
    } catch (err) {
      alert('⛔ 업로드 실패');
    }
  };

  const handleChildspDelete = async () => {
    if (!childspFilename) return;
    try {
      await axios.delete(`/api/admin/payroll/payrolldoc/delete-childsp?filename=${childspFilename}`);
      setChildspFilename('');
      setChildspPreviewUrl('');  // 🔹 미리보기 URL 제거
      alert('🗑️ 삭제 완료');
    } catch (err) {
      alert('⛔ 삭제 실패');
    }
  };

  //-----------------------------

  const handleDeductionPDF = () => {
    const params = new URLSearchParams({
      ddate: form.ddate || '',
      dname: form.dname || 'Jonathan Gutierrez',
      dnumber: form.dnumber || '',
      damount: form.damount || '25.00',
      filename: deductionFilename
    }).toString();
    window.open(`/api/admin/payroll/payrolldoc/deduction-pdf?${params}`, '_blank');
  };

  const handleDeductionUpload = async () => {
    if (!deductionFile) return alert('파일을 선택하세요.');
    const formData = new FormData();
    formData.append('file', deductionFile);
    try {
      const res = await axios.post('/api/admin/payroll/payrolldoc/upload-deduction', formData);
      const filename = res.data.filename;
      setDeductionFilename(filename);
      alert('✅ 업로드 성공');
    } catch (err) {
      alert('⛔ 업로드 실패');
    }
  };

  const handleDeductionDelete = async () => {
    if (!deductionFilename) return;
    try {
      await axios.delete(`/api/admin/payroll/payrolldoc/delete-deduction?filename=${deductionFilename}`);
      setDeductionFilename('');
      alert('🗑️ 삭제 완료');
    } catch (err) {
      alert('⛔ 삭제 실패');
    }
  };

  //-----------------------------
  const handleResetTimeFields = () => {
  setForm(f => ({
    ...f,
    rhour: '', rmin: '',
    ohour: '', omin: '',
    dhour: '', dmin: ''
  }));
  inputRefs.current[0]?.focus();  // 초기화 후 첫 칸 포커싱
};

  //-----------------------------
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
        <button onClick={handleResetTimeFields} style={{ marginLeft: '0.5rem' }}>초기화</button>
      </div>

      <h2>Cash Calculation Note</h2>
      <div className={styles.formRow}>
        <label>Date:</label>
        <input
          ref={el => inputRefs.current[8] = el}
          name="cdate"
          type="date"
          value={form.cdate}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(e, 8)}
          className={styles.wideInput}
        />

        <label>Name:</label>
        <input
          ref={el => inputRefs.current[9] = el}
          name="cname"
          value={form.cname}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(e, 9)}
          className={styles.wideInput}
        />

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

      <h2>Child Support Voucher Print</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className={styles.formRow} style={{ width: '50%' }}>
          <label>Date:</label>
          <input
            name="cs_date"
            type="date"
            value={form.cs_date || ''}
            onChange={handleChange}
            className={styles.wideInput}
          />

          <label>Name:</label>
          <input
            name="cs_name"
            placeholder="기본: Jonathan Gutierrez"
            value={form.cs_name || ''}
            onChange={handleChange}
            className={styles.wideInput}
          />

          <label>Check No.:</label>
          <input
            name="cs_checkno"
            value={form.cs_checkno || ''}
            onChange={handleChange}
          />

          <label>Amount:</label>
          <input
            name="cs_amount"
            value={form.cs_amount || '50.01'}
            onChange={handleChange}
          />

          <button type="button" onClick={handleChildspPDF}>PDF 보기</button>
        </div>

        <div className={styles.formRow} style={{ width: '50%' }}>
          <div className={styles.fileRow}>
  <label className={styles.fileLabel}>
    📄 Choose File
    <input
      type="file"
      onChange={e => setChildspFile(e.target.files[0])}
      hidden
    />
  </label>
  <span className={styles.fileNameBox}>
    {childspFile?.name || childspFilename || 'No file selected'}
  </span>
</div>
<button type="button" onClick={handleChildspUpload}>Upload</button>
<button type="button" onClick={handleChildspDelete}>Delete</button>


        </div>
      </div>

      <h2>Payroll Deduction Voucher Print</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className={styles.formRow} style={{ width: '50%' }}>
          <label>Date:</label>
          <input
            name="ddate"
            type="date"
            value={form.ddate || ''}
            onChange={handleChange}
            className={styles.wideInput}
          />

          <label>Name:</label>
          <input
            name="dname"
            placeholder="기본: Jonathan Gutierrez"
            value={form.dname || ''}
            onChange={handleChange}
            className={styles.wideInput}
          />

          <label>Check No.:</label>
          <input
            name="dnumber"
            value={form.dnumber || ''}
            onChange={handleChange}
          />

          <label>Amount:</label>
          <input
            name="damount"
            value={form.damount || '25.00'}
            onChange={handleChange}
          />

          <button type="button" onClick={handleDeductionPDF}>PDF 보기</button>
        </div>

        <div className={styles.formRow} style={{ width: '50%' }}>
          <div className={styles.fileRow}>
  <label className={styles.fileLabel}>
    📄 Choose File
    <input
      type="file"
      onChange={e => setDeductionFile(e.target.files[0])}
      hidden
    />
  </label>
  <span className={styles.fileNameBox}>
    {deductionFile?.name || deductionFilename || 'No file selected'}
  </span>
</div>
<button type="button" onClick={handleDeductionUpload}>Upload</button>
<button type="button" onClick={handleDeductionDelete}>Delete</button>

        </div>
      </div>

    </div>
  );
};

export default PayrollDocPage;
