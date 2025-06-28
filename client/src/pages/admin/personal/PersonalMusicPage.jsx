// ✅ PersonalMusicPage.jsx
import React, { useEffect, useState } from 'react';
import styles from './PersonalMusicPage.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PersonalMusicPage = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ date: '', comment: '', keyword: '' });
  const [musicFile, setMusicFile] = useState(null);
  const [textFile, setTextFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [audioSrc, setAudioSrc] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [keywordList, setKeywordList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchList();
    fetchKeywordList();
  }, [searchKeyword]);

  const fetchList = async () => {
    try {
      const { data } = await axios.get('/api/admin/personal/music', {
        params: { keyword: searchKeyword }
      });
      setList(data);
    } catch (err) {
      console.error('목록 불러오기 실패:', err);
    }
  };

  const fetchKeywordList = async () => {
    try {
      const { data } = await axios.get('/api/admin/personal/music/keywords');
      setKeywordList(data.keywords);
    } catch (err) {
      console.error('Keyword 목록 로딩 실패:', err);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpload = async e => {
    e.preventDefault();
    if (!form.date || !form.comment || !form.keyword) return alert('입력 필수 항목이 누락되었습니다.');
    if (!musicFile && !editId) return alert('음악 파일을 선택하세요.');

    const fd = new FormData();
    if (musicFile) fd.append('music', musicFile);
    if (textFile) fd.append('text', textFile);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    try {
      if (editId) {
        await axios.put(`/api/admin/personal/music/${editId}`, fd);
        setEditId(null);
      } else {
        await axios.post('/api/admin/personal/music/upload', fd);
      }
      setForm({ date: '', comment: '', keyword: '' });
      setMusicFile(null);
      setTextFile(null);
      fetchList();
    } catch (err) {
      alert('업로드 실패: ' + err.message);
    }
  };

  const handleDownload = filename => {
    window.open(`/api/admin/personal/music/download/${filename}`, '_blank');
  };

  const handleEdit = m => {
    setEditId(m.id);
    setForm({
      date: m.date ? m.date.split('T')[0] : '',
      comment: m.comment,
      keyword: m.keyword,
    });
    setMusicFile(null); // 기존 파일은 서버에 있음
    setTextFile(null);
  };

  const handleDelete = async id => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/personal/music/${id}`);
      fetchList();
    } catch {
      alert('삭제 실패');
    }
  };

  const playMusic = async (filename, textfile) => {
    setAudioSrc(`/uploads/personal/music_upload/${filename}`);
    if (textfile) {
      try {
        const { data } = await axios.get(`/api/admin/personal/music/text/${textfile}`);
        setTextContent(data);
      } catch {
        alert('텍스트 파일 로드 실패');
        setTextContent('');
      }
    }
  };

  return (
    <div className={styles.page}>
      <h2>Music Upload</h2>
      <form className={styles.uploadForm} onSubmit={handleUpload}>
        <div className={styles.fileRow}>
          <label className={styles.fileLabel}>
            🎵 Select Music File
            <input type="file" accept="audio/*" onChange={e => setMusicFile(e.target.files[0])} hidden />
          </label>
          <span className={styles.fileNameBox}>
            {musicFile?.name || (editId ? list.find(i => i.id === editId)?.original : 'No file selected')}
          </span>
        </div>

        <div className={styles.fileRow}>
          <label className={styles.fileLabel}>
            📄 Select Text File
            <input type="file" accept=".txt" onChange={e => setTextFile(e.target.files[0])} hidden />
          </label>
          <span className={styles.fileNameBox}>
            {textFile?.name || (editId ? list.find(i => i.id === editId)?.textfile : 'No file selected')}
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
          }}>Cancel</button>
        )}
      </form>

      <h2>Music List</h2>
      <div className={styles.searchBox}>
        <label>Search Keyword:</label>
        <select value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}>
          <option value="">All</option>
          {keywordList.map(k => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>File</th>
            <th>Date</th>
            <th>Comment</th>
            <th>Keyword</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map(m => (
            <tr key={m.id}>
              <td>
                <a href="#" onClick={e => { e.preventDefault(); playMusic(m.original, m.textfile); }}>
                  {m.original}
                </a>
              </td>
              <td>{m.date}</td>
              <td>{m.comment}</td>
              <td>{m.keyword}</td>
              <td>
                <button onClick={() => handleDownload(m.original)}>Download</button>{' '}
                <button onClick={() => handleEdit(m)}>Edit</button>{' '}
                <button onClick={() => handleDelete(m.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {audioSrc && (
        <div className={styles.modal} onClick={() => {
          setAudioSrc(null);
          setTextContent('');
        }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <audio src={audioSrc} controls autoPlay style={{ width: '100%' }} />
            {textContent && <pre className={styles.textBox}>{textContent}</pre>}
          </div>
        </div>
      )}

    </div>
  );
};

export default PersonalMusicPage;
