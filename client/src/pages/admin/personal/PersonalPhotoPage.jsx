// 📁 client/src/pages/admin/personal/PersonalPhotoPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PersonalPhotoPage.module.css';
import { useNavigate } from 'react-router-dom';

export default function PersonalPhotoPage() {
  const [photos, setPhotos] = useState([]);
  const [form, setForm]     = useState({ date: '', comment: '', place: '' });
  const [file, setFile]     = useState(null);
  const navigate            = useNavigate();

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    const { data } = await axios.get('/api/admin/personal/photo');
    setPhotos(data.photos);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFile = e => setFile(e.target.files[0]);

  const handleUpload = async e => {
    e.preventDefault();
    if (!file || !form.date || !form.comment || !form.place) {
      return alert('모든 필드를 채워주세요.');
    }
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('date', form.date);
    fd.append('comment', form.comment);
    fd.append('place', form.place);
    await axios.post('/api/admin/personal/photo/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setForm({ date: '', comment: '', place: '' });
    setFile(null);
    fetchPhotos();
  };

  const handleDelete = async id => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await axios.delete(`/api/admin/personal/photo/${id}`);
    fetchPhotos();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Photo Admin</h2>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>↩ 되돌아가기</button>
      </div>

      <form className={styles.uploadForm} onSubmit={handleUpload}>
        <input type="file" name="photo" onChange={handleFile} required />
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input type="text" name="comment" placeholder="Comment" value={form.comment} onChange={handleChange} required />
        <input type="text" name="place" placeholder="Place" value={form.place} onChange={handleChange} required />
        <button type="submit">Upload</button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thumbnailCol}>Thumbnail</th>
            <th className={styles.dateCol}>Date</th>
            <th>Comment</th>
            <th className={styles.placeCol}>Place</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {photos.map(p => {
            const d = new Date(p.date);
            const fd = `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
            return (
              <tr key={p.id}>
                <td className={styles.thumbnailCol}>
                  <a href={`/uploads/personal/photo_upload/${p.original}`} target="_blank" rel="noopener">
                    <img src={`/uploads/personal/photo_upload/${p.original}`} width="66" alt="" />
                  </a>
                </td>
                <td className={styles.dateCol}>{fd}</td>
                <td>{p.comment}</td>
                <td className={styles.placeCol}>{p.place}</td>
                <td className={styles.actionsCol}>
                  <button onClick={() => window.open(`/api/admin/personal/photo/download/${p.original}`, '_blank')}>
                    Download
                  </button>
                  <button onClick={() => navigate(`/admin/personal/photo/edit/${p.id}`)} className="edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="delete">
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}