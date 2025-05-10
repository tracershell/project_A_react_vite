import React, { useEffect, useState } from 'react';
import styles from './EmployeesListPage.module.css';
import axios from 'axios';

const EmployeesListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [selectedEid, setSelectedEid] = useState(''); // 🔑 선택된 EID
  const [activeFilter, setActiveFilter] = useState('active');

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ 서버에서 직원 목록 가져오기
  const fetchEmployees = async () => {
    const { data } = await axios.get('/api/admin/employees/employeeslistpage');
    setEmployees(data);
  };

  // ✅ 입력 폼 값 변경 처리
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 신규 직원 추가
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/employees/employeeslistpage/add', form);
    fetchEmployees();
    clearForm();
  };

  // ✅ 직원 정보 수정
  const handleEdit = async () => {
    if (!form.eid) {
      alert('수정할 직원 EID가 없습니다.');
      return;
    }
    await axios.post(`/api/admin/employees/employeeslistpage/edit/${form.eid}`, form);
    fetchEmployees();
    clearForm();
  };

  // ✅ 직원 삭제
  const handleDelete = async () => {
    if (!form.eid) {
      alert('삭제할 직원 EID가 없습니다.');
      return;
    }
    await axios.post(`/api/admin/employees/employeeslistpage/delete/${form.eid}`);
    fetchEmployees();
    clearForm();
  };

  // ✅ 직원 선택 → form 채우기 + selectedEid 설정
  const selectEmployee = (eid) => {
    const emp = employees.find(emp => emp.eid === eid);
    if (emp) {
      setForm(emp);
      setSelectedEid(eid);
    }
  };

  // ✅ 폼 초기화
  const clearForm = () => {
    setForm({});
    setSelectedEid('');
  };

  // ✅ active/inactive 필터링
  const filteredEmployees = employees.filter(emp => emp.status?.toLowerCase() === activeFilter);

  return (
    <div className={styles.page}>
      {/* ✅ 상단 입력 폼 */}
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

        {/* ✅ 버튼 영역 */}
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

      {/* ✅ 하단 직원 목록 테이블 */}
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
                <tr
                  key={emp.id}
                  onClick={() => selectEmployee(emp.eid)}
                  style={{ backgroundColor: form.eid === emp.eid ? '#ffff99' : '' }} // ✅ 선택된 직원 노란색 배경
                >
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
c