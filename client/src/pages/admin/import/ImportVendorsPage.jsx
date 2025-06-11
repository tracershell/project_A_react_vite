import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ImportVendorsPage.module.css';
import { useNavigate } from 'react-router-dom';

const ImportVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const inputsRef = useRef([]);

  // 1) 목록 불러오기
  useEffect(() => {
    fetchVendors();
  }, []);
  const fetchVendors = async () => {
    const { data } = await axios.get('/api/admin/import/vendors');
    setVendors(data);
  };

  // 2) 입력값 변경
  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 3) Enter 누르면 다음 필드로 포커스
  const handleKeyDown = (idx, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = inputsRef.current[idx + 1];
      if (next) next.focus();
    }
  };

  // 4) CRUD 핸들러
  const handleAdd = async () => {
    await axios.post('/api/admin/import/vendors/add', form);
    fetchVendors(); clearForm();
  };
  const handleEdit = async () => {
    await axios.put(`/api/admin/import/vendors/edit/${selectedId}`, form);
    fetchVendors(); clearForm();
  };
  const handleDelete = async () => {
    await axios.delete(`/api/admin/import/vendors/delete/${selectedId}`);
    fetchVendors(); clearForm();
  };

  // 5) 리스트 선택
  const selectRow = row => {
    setSelectedId(row.id);
    setForm(row);
  };

  const clearForm = () => {
    setSelectedId(null);
    setForm({});
  };

  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <h2>Vendors Input</h2>
      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        {[
          { name: 'vendor_id', placeholder: 'Vendor ID', width: '60px' },
          { name: 'name', placeholder: 'Vendor Name', width: '180px' },
          { name: 'deposit_rate', placeholder: 'Deposit Rate (%)', width: '70px' },
          { name: 'email', placeholder: 'Email', width: '200px' },
          { name: 'phone', placeholder: 'Phone no.', width: '130px' },
          { name: 'street', placeholder: 'Street Address', width: '200px' },
          { name: 'city', placeholder: 'City', width: '100px' },
          { name: 'state', placeholder: 'State', width: '100px' },
          { name: 'zip', placeholder: 'Zip', width: '50px' },
          { name: 'nation', placeholder: 'Nation', width: '100px' },
          { name: 'remark', placeholder: 'Remark', width: '250px' },
        ].map((field, i) => (
          <input
            key={field.name}
            ref={el => inputsRef.current[i] = el}
            name={field.name}
            value={form[field.name] || ''}
            placeholder={field.placeholder}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{ width: field.width, flex: 'none' }}
          />
        ))}

        <div className={styles.buttons}>
          <button onClick={handleAdd}>입력</button>
          <button onClick={handleEdit} disabled={!selectedId}>수정</button>
          <button onClick={handleDelete} disabled={!selectedId}>제거</button>
          <button className={styles.lightPink} onClick={() => navigate(-1)}>되돌아가기</button>
        </div>
      </form>



      <h2>Vendors List</h2>
      <div className={styles.list}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vendor ID</th>
              <th>Name</th>
              <th>Rate</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Nation</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr
                key={v.id}
                className={v.id === selectedId ? styles.selected : ''}
                onClick={() => selectRow(v)}
              >
                <td>{v.id}</td>
                <td>{v.vendor_id}</td>
                <td>{v.name}</td>
                <td>{v.deposit_rate}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{v.city}</td>
                <td>{v.nation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportVendorsPage;
