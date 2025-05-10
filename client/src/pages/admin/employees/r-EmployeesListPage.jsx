// /client/src/pages/admin/employees/EmployeesListPage.jsx
import React, { useEffect, useState } from 'react';
import styles from './EmployeesListPage.module.css';
import axios from 'axios';

const EmployeesListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [selectedEid, setSelectedEid] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data } = await axios.get('/api/admin/employees/employeeslistpage');
    setEmployees(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/employees/employeeslistpage/add', form);
    fetchEmployees();
    clearForm();
  };

  const handleEdit = async () => {
    await axios.post(`/api/admin/employees/employeeslistpage/edit/${form.eid}`, form);
    fetchEmployees();
    clearForm();
  };

  const handleDelete = async () => {
    await axios.post(`/api/admin/employees/employeeslistpage/delete/${form.eid}`);
    fetchEmployees();
    clearForm();
  };

  const selectEmployee = (eid) => {
    const emp = employees.find(emp => emp.eid === eid);
    if (emp) setForm(emp);
  };

  const clearForm = () => {
    setForm({});
  };

  const filteredEmployees = employees.filter(emp => emp.status?.toLowerCase() === activeFilter);

  return (
    <div className={styles.page}>
      <div className={`${styles.topSection} ${styles.compactForm}`}>
        <div className={styles.tableHeader}>
          <h2>Input, Search, Edit, Delete</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {['status', 'eid', 'name', 'ss', 'birth', 'email', 'phone', 'jcode', 'jtitle', 'sdate', 'edate', 'sick', 'work1', 'address', 'city', 'state', 'zip', 'remark'].map((field) => (
            <input
              key={field}
              name={field}
              type={field === 'birth' || field === 'sdate' || field === 'edate' ? 'date' : field === 'email' ? 'email' : field === 'sick' ? 'number' : 'text'}
              value={form[field] || ''}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              onChange={handleChange}
              style={{ flex: '1 1 auto' }}
            />
          ))}
        </form>

        <div className={styles.buttonGroup}>
          <button type="button" onClick={clearForm}>🧹 입력초기화</button>
          <button type="submit" onClick={handleSubmit}>➕ 입력저장</button>
          <input
            type="text"
            placeholder="EID 입력"
            value={selectedEid}
            onChange={(e) => setSelectedEid(e.target.value)}
            style={{ padding: '0.3rem' }}
          />
          <button type="button" onClick={() => selectEmployee(selectedEid)}>🔍 선택</button>
          <button type="button" onClick={handleEdit}>✏️ 수정</button>
          <button type="button" onClick={handleDelete}>🗑️ 삭제</button>
          <button type="button" onClick={() => window.open(`/view-one/${form.eid}`, '_blank')}>📋 보기</button>
          <button type="button" onClick={() => window.open(`/print/${form.eid}`, '_blank')}>📋 출력</button>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.tableHeader}>
          <h2>Employee List</h2>
          <div>
            <button onClick={() => setActiveFilter('inactive')}>Inactive</button>
            <button onClick={() => setActiveFilter('active')}>Active</button>
          </div>
        </div>

        <div style={{ maxHeight: '460px', overflowY: 'auto', border: '1px solid #ccc' }}>
          <table className={styles.compactTable}>
            <thead>
              <tr>
                {['ID', 'Status', 'EID', 'Name', 'SS No', 'Birthday', 'Email', 'Phone', 'Job Code', 'Job Title', 'Start', 'End', 'Sick', 'Work', 'Address', 'City', 'State', 'Zip', 'Remark'].map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                <tr key={emp.id} onClick={() => selectEmployee(emp.eid)}>
                  <td>{emp.id}</td>
                  <td>{emp.status}</td>
                  <td>{emp.eid}</td>
                  <td>{emp.name}</td>
                  <td>{emp.ss}</td>
                  <td>{emp.birth}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.jcode}</td>
                  <td>{emp.jtitle}</td>
                  <td>{emp.sdate}</td>
                  <td>{emp.edate}</td>
                  <td>{emp.sick}</td>
                  <td>{emp.work1}</td>
                  <td>{emp.address}</td>
                  <td>{emp.city}</td>
                  <td>{emp.state}</td>
                  <td>{emp.zip}</td>
                  <td>{emp.remark}</td>
                </tr>
              )) : (
                <tr><td colSpan="19">직원 정보가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesListPage;
