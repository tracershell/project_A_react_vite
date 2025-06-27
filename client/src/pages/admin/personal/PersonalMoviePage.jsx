import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PersonalMoviePage.module.css';
import { useNavigate } from 'react-router-dom';
import VideoModal from '../../../components/video_modal/VideoModal';

export default function PersonalMoviePage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ date: '', comment: '', keyword: '' });
  const [movieFile, setMovieFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordList, setKeywordList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchList();
    fetchKeywordList();
  }, [searchKeyword]);

  const fetchList = async () => {
    try {
      const { data } = await axios.get('/api/admin/personal/movie', {
        params: { keyword: searchKeyword }
      });
      setList(data);
    } catch (err) {
      console.error('목록 불러오기 실패:', err);
    }
  };

  const fetchKeywordList = async () => {
    try {
      const { data } = await axios.get('/api/admin/personal/movie/keywords');
      setKeywordList(data.keywords);
    } catch (err) {
      console.error('Keyword 목록 로딩 실패:', err);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpload = async e => {
    e.preventDefault();
    setUploadProgress(0);
    if (!form.date || !form.comment || !form.keyword) return alert('모든 필수 입력값을 입력하세요.');
    if (!movieFile && !editId) return alert('Movie 파일을 선택하세요.');

    const fd = new FormData();
    if (movieFile) fd.append('movie', movieFile);
    if (thumbFile) fd.append('thumbnail', thumbFile);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    try {
      const config = {
        onUploadProgress: e => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        }
      };
      if (editId) {
        await axios.put(`/api/admin/personal/movie/${editId}`, fd, config);
        setEditId(null);
      } else {
        await axios.post('/api/admin/personal/movie/upload', fd, config);
      }

      setForm({ date: '', comment: '', keyword: '' });
      setMovieFile(null);
      setThumbFile(null);
      setUploadProgress(0);
      fetchList();
    } catch (err) {
      alert('업로드 실패: ' + (err.response?.data?.error || err.message));
      setUploadProgress(0);
    }
  };

  const handleEdit = m => {
    setEditId(m.id);
    setForm({
      date: m.date?.split('T')[0] || '',
      comment: m.comment,
      keyword: m.keyword
    });
    setMovieFile(null);
    setThumbFile(null);
  };

  const handleDelete = async id => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/personal/movie/${id}`);
      fetchList();
    } catch {
      alert('삭제 실패');
    }
  };

  const handleDownload = filename => {
    window.open(`/api/admin/personal/movie/download/${filename}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>🎬 Movie Upload</h2>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>↩ 되돌아가기</button>
      </div>

      <form className={styles.uploadForm} onSubmit={handleUpload}>
        <div className={styles.fileRow}>
          <label className={styles.fileLabel}>
            🎞 Select Movie File
            <input type="file" accept="video/*" onChange={e => setMovieFile(e.target.files[0])} hidden />
          </label>
          <span className={styles.fileNameBox}>
            {movieFile?.name || (editId ? list.find(i => i.id === editId)?.original : 'No file selected')}
          </span>
        </div>

        <div className={styles.fileRow}>
          <label className={styles.fileLabel}>
            🖼 Select Thumbnail
            <input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files[0])} hidden />
          </label>
          <span className={styles.fileNameBox}>
            {thumbFile?.name || (editId ? list.find(i => i.id === editId)?.thumbnail : 'No file selected')}
          </span>
        </div>

        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input type="text" name="comment" value={form.comment} placeholder="Comment" onChange={handleChange} />
        <input type="text" name="keyword" value={form.keyword} placeholder="Keyword" onChange={handleChange} />
        <button type="submit">{editId ? 'Save' : 'Upload'}</button>
        {editId && (
          <button type="button" onClick={() => {
            setEditId(null);
            setForm({ date: '', comment: '', keyword: '' });
            setMovieFile(null);
            setThumbFile(null);
          }}>Cancel</button>
        )}
      </form>

      {/* ⏳ 업로드 진행률 표시 */}
      {uploadProgress > 0 && (
        <div style={{ width: '100%', marginTop: '8px' }}>
          <div style={{
            height: '6px',
            width: `${uploadProgress}%`,
            backgroundColor: '#3399ff',
            transition: 'width 0.3s'
          }} />
          <div style={{ fontSize: '10px', color: '#333' }}>{uploadProgress}%</div>
        </div>
      )}

      <h2>🎞 Movie List</h2>
      <div className={styles.searchBox}>
        <label>Search Keyword:</label>
        <select value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}>
          <option value="">All</option>
          {keywordList.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thumbnailCol}>Thumbnail</th>
            <th className={styles.dateCol}>Date</th>
            <th className={styles.commentCol}>Comment</th>
            <th className={styles.keywordCol}>Keyword</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan={5}>등록된 영화가 없습니다.</td></tr>
          ) : list.map(movie => (
            <tr key={movie.id}>
              <td>
                <img
                  src={`/uploads/personal/movie-thumbnail_upload/${movie.thumbnail}`}
                  alt="thumb"
                  className={styles.thumbnailImg}
                  onClick={() => setSelectedVideo(`/uploads/personal/movie_upload/${movie.original}`)}
                />
              </td>
              <td>{movie.date}</td>
              <td>{movie.comment}</td>
              <td>{movie.keyword}</td>
              <td>
                <button onClick={() => handleDownload(movie.original)}>Download</button>{' '}
                <button onClick={() => handleEdit(movie)}>Edit</button>{' '}
                <button onClick={() => handleDelete(movie.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🎥 Video 재생 모달 */}
      {selectedVideo && <VideoModal videoSrc={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </div>
  );
}
