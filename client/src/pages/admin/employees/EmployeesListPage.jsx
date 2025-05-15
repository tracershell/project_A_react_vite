import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 내부 이동을 위한 import
import styles from './EmployeesListPage.module.css'; // ✅ CSS 모듈 import
import axios from 'axios';

const EmployeesListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [selectedEid, setSelectedEid] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');
  const navigate = useNavigate(); // ✅ 훅 선언

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

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Status', 'EID', 'Name', 'SS No', 'Birthday', 'Email', 'Phone', 'Job Code',
      'Job Title', 'Start', 'End', 'Sick', 'Vac', 'Work', 'Address', 'City', 'State', 'Zip', 'Remark'
    ];

    const rows = filteredEmployees.map(emp => [
      emp.id, emp.status, emp.eid, emp.name, emp.ss,
      emp.birth?.split('T')[0] || '', emp.email, emp.phone,
      emp.jcode, emp.jtitle,
      emp.sdate?.split('T')[0] || '', emp.edate?.split('T')[0] || '',
      emp.sick, emp.vac, emp.workl, emp.address,
      emp.city, emp.state, emp.zip, emp.remark
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_${activeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    if (!date) return null;
    if (date.includes('T')) return date.split('T')[0];
    return date;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/employees/employeeslistpage/add', form);
      alert('입력이 완료되었습니다.');
      fetchEmployees();
      clearForm();
    } catch (err) {
      alert(err.response?.data?.error || '입력 중 오류 발생');
    }
  };

  const handleEdit = async () => {
    if (!form.eid) {
      alert('수정할 직원 EID를 선택하세요.');
      return;
    }
    const updatedForm = {
      ...form,
      birth: formatDate(form.birth),
      sdate: formatDate(form.sdate),
      edate: formatDate(form.edate),
    };
    try {
      const res = await axios.post(`/api/admin/employees/employeeslistpage/edit/${form.eid}`, updatedForm);
      if (res.data.success) {
        alert('수정 완료');
        fetchEmployees();
        clearForm();
      } else {
        alert(res.data.error || '수정 실패');
      }
    } catch (err) {
      alert(err.response?.data?.error || '수정 중 오류 발생');
    }
  };

  const handleDelete = async () => {
    if (!form.eid) {
      alert('삭제할 직원 EID를 선택하세요.');
      return;
    }
    try {
      const res = await axios.post(`/api/admin/employees/employeeslistpage/delete/${form.eid}`);
      if (res.data.success) {
        alert('삭제 완료');
        fetchEmployees();
        clearForm();
      } else {
        alert(res.data.error || '삭제 실패');
      }
    } catch (err) {
      alert(err.response?.data?.error || '삭제 중 오류 발생');
    }
  };

  const selectEmployee = (eid) => {
    const emp = employees.find(emp => String(emp.eid) === String(eid));
    if (emp) {
      setForm(emp);
      setSelectedEid(eid);
    } else {
      alert('직원을 찾을 수 없습니다.');
    }
  };

  const clearForm = () => {
    setForm({});
    setSelectedEid('');
  };

  const filteredEmployees = employees.filter(emp => emp.status?.toLowerCase() === activeFilter);

  return (
    <div className={styles.page}>
      <div className={`${styles.topSection} ${styles.compactForm}`}>
        <div className={styles.tableHeader}>
          <h2>Input, Search, Edit, Delete</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {[
            'status', 'eid', 'name', 'ss', 'birth', 'email', 'phone', 'jcode', 'jtitle',
            'sdate', 'edate', 'sick', 'vac', 'workl', 'address', 'city', 'state', 'zip', 'remark'
          ].map((field) => (
            <input
              key={field}
              name={field}
              type={
                field.includes('date') ? 'date' :
                  field === 'email' ? 'email' :
                    field === 'sick' || field === 'vac' ? 'number' : 'text'
              }
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

          {/* ✅ 내부 이동으로 변경된 버튼 */}
          <button
            type="button"
            disabled={!form.eid}
            onClick={() => navigate(`/admin/employees/employeesprintpage/print/${form.eid}`)}
          >
            📋 선택 출력
          </button>

          <button
            type="button"
            onClick={() => window.open(`/api/admin/employees/employeeslistpage/pdf?status=${activeFilter}`, '_blank')}
          >
            📋 직원 출력
          </button>
          <button type="button" onClick={handleExportCSV}>📥 CSV 출력</button>
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
                {[
                  'ID', 'Status', 'EID', 'Name', 'SS No', 'Birthday', 'Email', 'Phone', 'Job Code',
                  'Job Title', 'Start', 'End', 'Sick', 'Vac', 'Work', 'Address', 'City', 'State', 'Zip', 'Remark'
                ].map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                <tr
                  key={emp.id}
                  onClick={() => selectEmployee(emp.eid)}
                  style={{ backgroundColor: form.eid === emp.eid ? '#ffff99' : '' }}
                >
                  <td>{emp.id}</td>
                  <td>{emp.status}</td>
                  <td>{emp.eid}</td>
                  <td>{emp.name}</td>
                  <td>{emp.ss}</td>
                  <td>{emp.birth?.split('T')[0]}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.jcode}</td>
                  <td>{emp.jtitle}</td>
                  <td>{emp.sdate?.split('T')[0]}</td>
                  <td>{emp.edate?.split('T')[0]}</td>
                  <td>{emp.sick}</td>
                  <td>{emp.vac}</td>
                  <td>{emp.workl}</td>
                  <td>{emp.address}</td>
                  <td>{emp.city}</td>
                  <td>{emp.state}</td>
                  <td>{emp.zip}</td>
                  <td>{emp.remark}</td>
                </tr>
              )) : (
                <tr><td colSpan="20">직원 정보가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesListPage;
