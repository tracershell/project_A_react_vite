// client/src/pages/admin/employees/EmployeesDataPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './EmployeesDataPage.module.css';

const EmployeesDataPage = () => {
  const [employees, setEmployees] = useState([]);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ eid: '', comment: '' });
  const [fileInput, setFileInput] = useState(null);
  const [filterEid, setFilterEid] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await axios.get('/api/admin/employees/employeesdata');
    setEmployees(data.employees);
    setFiles(data.files);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    setFileInput(e.target.files[0]);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!form.eid || !fileInput) {
      alert('직원을 선택하고 파일을 첨부해주세요.');
      return;
    }
    const fd = new FormData();
    fd.append('eid', form.eid);
    fd.append('comment', form.comment);
    fd.append('file', fileInput);

    try {
      await axios.post(
        '/api/admin/employees/employeesdata/upload',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert('업로드 완료');
      setForm({ eid: '', comment: '' });
      setFileInput(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || '업로드 중 오류 발생');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/employees/employeesdata/delete/${id}`);
      fetchData();
    } catch {
      alert('삭제 중 오류 발생');
    }
  };

  const filtered = filterEid ? files.filter(f => f.eid === filterEid) : files;

  return (
    <div className={styles.page}>
      <div className={styles.topSection}>
        <h2>Employee Document Manager</h2>
        <form onSubmit={handleUpload} className={styles.uploadForm}>
          <select name="eid" value={form.eid} onChange={handleChange} required>
            <option value="">:: 직원 선택 ::</option>
            {employees.map(emp => (
              <option key={emp.eid} value={emp.eid}>
                {emp.name} ({emp.eid})
              </option>
            ))}
          </select>
          <input type="file" onChange={handleFileChange} required />
          <input
            name="comment"
            type="text"
            value={form.comment}
            placeholder="파일 설명"
            onChange={handleChange}
          />
          <button type="submit">Upload</button>
        </form>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.tableHeader}>
          <h2>Uploaded Files</h2>
          <select
            value={filterEid}
            onChange={e => setFilterEid(e.target.value)}
          >
            <option value="">:: 전체 보기 ::</option>
            {employees.map(emp => (
              <option key={emp.eid} value={emp.eid}>
                {emp.name} ({emp.eid})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                <th>직원</th>
                <th>파일 이름</th>
                <th>설명</th>
                <th>업로드 날짜</th>
                <th>다운로드</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(f => (
                  <tr key={f.id}>
                    <td>{f.name} ({f.eid})</td>
                    <td>{f.originalname}</td>
                    <td>{f.comment}</td>
                    <td>{f.upload_date.split('T')[0]}</td>
                    <td>
                      <a
                        href={`/e_uploads/${f.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </td>
                    <td>
                      <button type="button" onClick={() => handleDelete(f.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">파일이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesDataPage;
