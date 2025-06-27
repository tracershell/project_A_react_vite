// 📁 client/src/pages/admin/personal/PersonalPhotoPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PersonalPhotoPage.module.css';
import { useNavigate } from 'react-router-dom';

export default function PersonalPhotoPage() {
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({ date: '', code: '', comment: '', place: '' });
  const [file, setFile] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [codeList, setCodeList] = useState([]);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotos();
    fetchCodes();
  }, [searchCode]);

  const fetchPhotos = async () => {
    const { data } = await axios.get('/api/admin/personal/photo', {
      params: { code: searchCode }
    });
    setPhotos(data.photos);
  };

  const fetchCodes = async () => {
    const { data } = await axios.get('/api/admin/personal/photo/codes');
    setCodeList(data.codes);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setFile(e.target.files[0]);

  const handleUpload = async e => {
    e.preventDefault();
    if (!file && !editId) return alert('파일을 선택하세요.');
    if (!form.date || !form.comment || !form.place) return alert('모든 입력란을 채우세요.');

    const formData = new FormData();
    if (file) formData.append('photo', file);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    try {
      if (editId) {
        await axios.put(`/api/admin/personal/photo/${editId}`, formData);
        setEditId(null);
      } else {
        await axios.post('/api/admin/personal/photo/upload', formData);
      }
      setForm({ date: '', code: '', comment: '', place: '' });
      setFile(null);
      fetchPhotos();
    } catch (err) {
      alert('업로드 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = photo => {
  setEditId(photo.id);

  const formattedDate = photo.date?.split('T')?.[0] || ''; // ← 날짜 잘라서 yyyy-MM-dd로
  setForm({
    date: formattedDate,
    code: photo.code,
    comment: photo.comment,
    place: photo.place
  });
};

  const handleDownload = filename => {
    window.open(`/api/admin/personal/photo/download/${filename}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}><h2>Photo Input</h2>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>↩ 되돌아가기</button>
      </div>

      <form className={styles.uploadForm} onSubmit={handleUpload}>
        <div className={styles.fileRow}>
  <label className={styles.fileLabel}>
    📷 Choose Photo File
    <input type="file" accept="image/*" onChange={handleFile} hidden />
  </label>
  <span className={styles.fileNameBox}>
    {file?.name || (editId ? photos.find(i => i.id === editId)?.original : 'No file selected')}
  </span>
</div>
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input name="code" value={form.code} onChange={handleChange} placeholder="Code" />
        <input name="comment" value={form.comment} onChange={handleChange} placeholder="Comment" />
        <input name="place" value={form.place} onChange={handleChange} placeholder="Place" />
        <button type="submit">{editId ? 'Update' : 'Upload'}</button>
      </form>

      <div className={styles.tableWrapper}>
        <h2>Photo List</h2>
        <div className={styles.codeFilterBox}>
          <label>Filter by Code:</label>
          <select
  className={styles.searchSelect}
  value={searchCode}
  onChange={e => setSearchCode(e.target.value)}
>
            <option value=''>All</option>
            {codeList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thumbnailCol}>Thumbnail</th>
              <th className={styles.dateCol}>Date</th>
              <th className={styles.codeCol}>Code</th>
              <th className={styles.commentCol}>Comment</th>
              <th className={styles.placeCol}>Place</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {photos.map(photo => (
              <tr key={photo.id}>
                <td><img src={`/uploads/personal/photo_upload/${photo.thumbnail}`} alt="thumb" /></td>
                <td>{photo.date}</td>
                <td>{photo.code}</td>
                <td>{photo.comment}</td>
                <td>{photo.place}</td>
                <td>
                  <button onClick={() => handleDownload(photo.original)}>Download</button>{' '}
                  <button onClick={() => handleEdit(photo)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(photo.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
