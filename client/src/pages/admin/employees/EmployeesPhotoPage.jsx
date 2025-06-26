// EmployeesPhotoPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './EmployeesPhotoPage.module.css';
import { useNavigate } from 'react-router-dom';

const EmployeesPhotoPage = () => {
  const [employees, setEmployees] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({ eid: '', comment: '' });
  const [fileInput, setFileInput] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await axios.get('/api/admin/employees/employeesphotopage');
    setEmployees(data.employees);
    setPhotos(data.photos);
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
      alert('직원을 선택하고 사진을 첨부해주세요.');
      return;
    }
    const fd = new FormData();
    fd.append('eid', form.eid);
    fd.append('comment', form.comment);
    fd.append('file', fileInput);

    try {
      await axios.post('/api/admin/employees/employeesphotopage/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('업로드 완료');
      setForm({ eid: '', comment: '' });
      setFileInput(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || '업로드 실패');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/employees/employeesphotopage/delete/${id}`);
      fetchData();
    } catch {
      alert('삭제 실패');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topSection}>
        <h2>Employees Photo Manager</h2>
        <form onSubmit={handleUpload} className={styles.uploadForm}>
          <select name="eid" value={form.eid} onChange={handleChange} required>
            <option value="">:: 직원 선택 ::</option>
            {employees.map(emp => (
              <option key={emp.eid} value={emp.eid}>{emp.name} ({emp.eid})</option>
            ))}
          </select>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
          <input
            name="comment"
            type="text"
            value={form.comment}
            placeholder="사진 설명"
            onChange={handleChange}
          />
          <button type="submit">Upload</button>
          <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: '0.5rem' }}>
  ↩ 되돌아가기
</button>
        </form>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.tableHeader}>
          <h2>Upload Photos</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                <th>직원</th>
                <th>사진</th>
                <th>설명</th>
                <th>업로드 날짜</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {photos.length > 0 ? (
                photos.map(f => (
                  <tr key={f.id}>
                    <td>{f.name} ({f.eid})</td>
                    <td>
  <img
    src={`/uploads/employees/eimg_upload/${f.filename}`}
    alt="employee"
    height="60"
    style={{ cursor: 'pointer', borderRadius: '4px' }}
    onClick={() => setZoomedImage(`/uploads/employees/eimg_upload/${f.filename}`)}
  />
</td>
                    <td>{f.comment}</td>
                    <td>{f.upload_date.split('T')[0]}</td>
                    <td><button type="button" onClick={() => handleDelete(f.id)}>Delete</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">등록된 사진이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {zoomedImage && (
  <div
    onClick={() => setZoomedImage(null)}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      cursor: 'pointer'
    }}
  >
    <img
      src={zoomedImage}
      alt="Zoomed"
      style={{
        width: '400px',
    height: 'auto',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
      }}
    />
  </div>
)}

    </div>
    


  );
};

export default EmployeesPhotoPage;
