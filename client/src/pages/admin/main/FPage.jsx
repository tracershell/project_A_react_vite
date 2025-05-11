import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FPage = () => {
  const [dateValue, setDateValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [dataList, setDataList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get('/api/admin/main/fpage/list');
    setDataList(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/admin/main/fpage/update/${editId}`, {
          date_value: dateValue,
          number_value: numberValue,
          name_value: nameValue,
        });
        alert('수정되었습니다.');
      } else {
        await axios.post('/api/admin/main/fpage/add', {
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
      fetchData();
    } catch (err) {
      console.error(err);
      alert('저장/수정 실패');
    }
  };

  const handleEdit = (item) => {
    setDateValue(item.date_value);
    setNumberValue(item.number_value);
    setNameValue(item.name_value);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/main/fpage/delete/${id}`);
      if (selectedId === id) setSelectedId(null);
      alert('삭제되었습니다.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleReload = () => {
    fetchData();
  };

  // ✅ 내부 이동으로 보기 구현
  const handleView = () => {
    if (!selectedId) return;
    navigate(`/admin/main/fpageview/${selectedId}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>F Page — 입력·수정·삭제·선택·보기</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}
      >
        <input
          type="date"
          value={dateValue}
          onChange={e => setDateValue(e.target.value)}
          required
        />
        <input
          type="number"
          value={numberValue}
          onChange={e => setNumberValue(e.target.value)}
          placeholder="숫자 입력"
          required
        />
        <input
          type="text"
          value={nameValue}
          onChange={e => setNameValue(e.target.value)}
          placeholder="이름 입력"
          required
        />
        <button type="submit">{editId ? '수정' : '저장'}</button>
      </form>

      <button onClick={handleReload} style={{ margin: '10px 0' }}>
        🔄 목록 새로고침
      </button>

      {selectedId != null && (
        <div style={{ marginBottom: 20 }}>
          👉 선택된 ID: <strong>{selectedId}</strong>
          <button onClick={handleView} style={{ marginLeft: 10 }}>
            👀 보기
          </button>
        </div>
      )}

      <h3>데이터 목록</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {dataList.map(item => (
          <li
            key={item.id}
            style={{
              padding: 8,
              marginBottom: 6,
              background: selectedId === item.id ? '#e0f7fa' : '#f9f9f9',
              borderRadius: 4,
            }}
          >
            {item.date_value} | {item.number_value} | {item.name_value}
            <button onClick={() => handleEdit(item)} style={{ marginLeft: 10 }}>
              수정
            </button>
            <button onClick={() => handleDelete(item.id)} style={{ marginLeft: 5 }}>
              삭제
            </button>
            <button onClick={() => handleSelect(item.id)} style={{ marginLeft: 5 }}>
              선택
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FPage;
