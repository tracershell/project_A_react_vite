// 📁 client/src/pages/admin/general/GeneralCompanyDocPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './GeneralCompanyDocPage.module.css';
import axios from 'axios';

const GeneralCompanyDocPage = () => {
  const [form, setForm] = useState({ cid: '', comment: '' });
  const [fileInput, setFileInput] = useState(null);
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filterCid, setFilterCid] = useState('');
  const formRef = useRef(null);

  // — 데이터 로딩 함수들 —
  const fetchList = async () => {
    try {
      const { data } = await axios.get('/api/admin/general/companydoc');
      setList(data);
    } catch (err) {
      console.error('목록 조회 중 에러:', err);
    }
  };

  const fetchCidList = async () => {
    try {
      const { data } = await axios.get('/api/admin/general/companydoc/cidlist');
      setCidList(data);
    } catch (err) {
      console.error('CID 리스트 조회 중 에러:', err);
    }
  };


  // 3) 훅에서 fetchList 호출
  useEffect(() => {
    fetchList();
    fetchCidList();
  }, []);


  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = e => setFileInput(e.target.files[0]);

  const handleUpload = async e => {
    e.preventDefault();
    if (!form.cid || !fileInput) return alert('카테고리와 파일을 입력하세요.');
    const fd = new FormData();
    fd.append('cid', form.cid);
    fd.append('comment', form.comment);
    fd.append('file', fileInput);

    await axios.post('/api/admin/general/companydoc/upload', fd);
    setForm({ cid: '', comment: '' });
    setFileInput(null);
    fetchList();

    // 👇 폼 리셋 강제
    if (formRef.current) formRef.current.reset();
  };

  const handleDelete = async id => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await axios.delete(`/api/admin/general/companydoc/delete/${id}`);
    fetchList();
  };

  const handleSelect = record => {
    setSelectedId(record.id);
    setForm({ cid: record.cid, comment: record.comment });
  };

  const filtered = !filterCid
  ? list
  : list.filter(item => item.cid === filterCid);

  const [cidList, setCidList] = useState([]);


  const handleUpdate = async () => {
    if (!selectedId) return alert('수정할 항목을 선택하세요.');
    try {
      await axios.put(`/api/admin/general/companydoc/update/${selectedId}`, form);
      alert('수정 완료');
      setForm({ cid: '', comment: '' });
      setSelectedId(null);
      fetchList();
    } catch (err) {
      alert('수정 실패');
    }
  };

  // 초기화 버튼
  const handleResetForm = () => {
    setForm({ cid: '', comment: '' });
    setFileInput(null);
    setSelectedId(null);
  };

  return (
    <div className={styles.page}>
      <h2>Company Document Upload</h2>
      <form onSubmit={handleUpload} className={styles.uploadForm} ref={formRef} >
        <input type="file" onChange={handleFileChange} required />
        <input
          name="cid"
          value={form.cid}
          onChange={handleChange}
          placeholder="카테고리"
          required
        />
        <input
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="파일 설명"
        />
        <button type="submit">Upload</button>
        <button type="button" onClick={() => setForm({ cid: '', comment: '' })}>
          취소
        </button>
        <button type="button" onClick={handleUpdate} disabled={!selectedId}>
          수정
        </button>
        {/* ✅ 초기화 버튼 추가 */}
        <button type="button" onClick={handleResetForm}>
          초기화
        </button>
      </form>

      <div className={styles.filter}>
        <select
  value={filterCid}
  onChange={e => setFilterCid(e.target.value)}
>
  <option value="">:: 전체 보기 ::</option>
  {cidList.map((cid, idx) => (
    <option key={idx} value={cid}>{cid}</option>
  ))}
</select>
      </div>

      <table className={styles.compactTable}>
        <thead>
          <tr>
            <th>카테고리</th>
            <th>파일이름</th>
            <th>설명</th>
            <th>업로드일</th>
            <th>다운로드</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(f => (
            <tr key={f.id} onClick={() => handleSelect(f)}>
              <td>{f.cid}</td>
              <td>{f.originalname}</td>
              <td>{f.comment}</td>
              <td>{f.upload_date?.split('T')[0]}</td>
              <td>
                <a
                  href={`/uploads/company/cdoc_upload/${f.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </td>
              <td>
                <button onClick={() => handleDelete(f.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeneralCompanyDocPage;
