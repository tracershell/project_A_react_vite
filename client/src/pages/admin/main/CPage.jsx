import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CPage = () => {
  const [dateValue, setDateValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [dataList, setDataList] = useState([]);
  const [editId, setEditId] = useState(null); // ✅ 수정할 데이터 ID

  // ✅ 데이터 불러오기
  const fetchData = async () => {
    const res = await axios.get('/api/admin/main/cpage/list');
    setDataList(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ 저장 또는 수정 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/admin/main/cpage/update/${editId}`, {
          date_value: dateValue,
          number_value: numberValue,
          name_value: nameValue,
        });
        alert('수정되었습니다.');
      } else {
        await axios.post('/api/admin/main/cpage/add', {
          date_value: dateValue,
          number_value: numberValue,
          name_value: nameValue,
        });
        alert('저장되었습니다.');
      }
      setDateValue('');
      setNumberValue('');
      setNameValue('');
      setEditId(null);
      fetchData(); // ✅ 목록 새로고침
    } catch (err) {
      console.error('저장/수정 실패:', err);
      alert('저장/수정 실패');
    }
  };

  // ✅ 수정 버튼 클릭 시 값 채우기
  const handleEdit = (item) => {
    setDateValue(item.date_value);
    setNumberValue(item.number_value);
    setNameValue(item.name_value);
    setEditId(item.id);
  };

  // ✅ 삭제 처리
  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/admin/main/cpage/delete/${id}`);
        alert('삭제되었습니다.');
        fetchData(); // ✅ 삭제 후 목록 새로고침
      } catch (err) {
        console.error('삭제 실패:', err);
        alert('삭제 실패');
      }
    }
  };

  // ✅ 목록 강제 조회 버튼
  const handleReload = () => {
    fetchData();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>C Page - DB 입력/수정/삭제</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} required />
        <input type="number" value={numberValue} onChange={(e) => setNumberValue(e.target.value)} placeholder="숫자 입력" required />
        <input type="text" value={nameValue} onChange={(e) => setNameValue(e.target.value)} placeholder="이름 입력" required />
        <button type="submit">{editId ? '수정' : '저장'}</button>
      </form>

      <button onClick={handleReload} style={{ marginTop: '10px' }}>🔄 목록 새로고침</button>

      <h3>데이터 목록</h3>
      <ul>
        {dataList.map((item) => (
          <li key={item.id}>
            {item.date_value} | {item.number_value} | {item.name_value}
            <button onClick={() => handleEdit(item)} style={{ marginLeft: '10px' }}>수정</button>
            <button onClick={() => handleDelete(item.id)} style={{ marginLeft: '5px' }}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CPage;
