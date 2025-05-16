import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ImportExtraItemsPage.module.css';

const ImportExtraItemsPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const inputsRef = useRef([]);

  useEffect(() => {
    fetchItems();
  }, []);
  const fetchItems = async () => {
    const { data } = await axios.get('/api/admin/import/extra');
    setItems(data);
  };

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = inputsRef.current[idx + 1];
      if (next) next.focus();
    }
  };

  const handleAdd = async () => {
    await axios.post('/api/admin/import/extra/add', form);
    fetchItems();
    clearForm();
  };
  const handleEdit = async () => {
    if (!selectedId) return;
    await axios.put(`/api/admin/import/extra/edit/${selectedId}`, form);
    fetchItems();
    clearForm();
  };
  const handleDelete = async () => {
    if (!selectedId) return;
    await axios.delete(`/api/admin/import/extra/delete/${selectedId}`);
    fetchItems();
    clearForm();
  };

  const selectRow = row => {
    setSelectedId(row.id);
    setForm(row);
  };

  const clearForm = () => {
    setSelectedId(null);
    setForm({});
  };

  return (
    <div className={styles.page}>
      <h2>Extra Pay Input</h2>
      <form className={styles.formRow} onSubmit={e => e.preventDefault()}>
        <input
          ref={el => inputsRef.current[0] = el}
          name="extra_no"
          value={form.extra_no || ''}
          placeholder="extra_no"
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(0, e)}
        />
        <input
          ref={el => inputsRef.current[1] = el}
          name="po_no"
          value={form.po_no || ''}
          placeholder="extra_po_no"
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(1, e)}
        />
        <select
          ref={el => inputsRef.current[2] = el}
          name="rate_apply"
          value={form.rate_apply || ''}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(2, e)}
          style={{
            color:
              form.rate_apply === '환율적용' ? 'blue'
                : form.rate_apply === '환율비적용' ? 'red'
                : '#000'
          }}
        >
          <option value="">선택</option>
          <option value="환율적용">환율적용</option>
          <option value="환율비적용">환율비적용</option>
        </select>
        <input
          ref={el => inputsRef.current[3] = el}
          name="comment"
          value={form.comment || ''}
          placeholder="comment"
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(3, e)}
        />

        <button type="button" onClick={handleAdd}>입력</button>
        <button type="button" onClick={handleEdit} disabled={!selectedId}>수정</button>
        <button type="button" onClick={handleDelete} disabled={!selectedId}>제거</button>
      </form>

      <h2>Extra Pay List</h2>
      <div className={styles.list}>
        <table className="compactTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Extra no.</th>
              <th>PO no.</th>
              <th>Select</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr
                key={it.id}
                className={it.id === selectedId ? "selected" : ""}
                onClick={() => selectRow(it)}
              >
                <td>{it.id}</td>
                <td>{it.extra_no}</td>
                <td>{it.po_no}</td>
                <td style={{ color: it.rate_apply === '환율적용' ? 'blue' : 'red' }}>
                  {it.rate_apply}
                </td>
                <td>{it.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportExtraItemsPage;
