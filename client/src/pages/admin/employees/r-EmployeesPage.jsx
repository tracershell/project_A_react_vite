import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeesPage.module.css';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    status: '',
    eid: '',
    name: '',
    ss: '',
    birth: '',
    email: '',
    phone: '',
    jcode: '',
    jtitle: '',
    sdate: '',
    edate: '',
    sick: '',
    work1: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    remark: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/admin/employees/employees_list');
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      alert('직원 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/employees/employees_list/add', formData);
      alert('저장되었습니다.');
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="employee-page">
      <div className="top-section">
        <h2>Input, Search, Edit, Delete</h2>
        <form onSubmit={handleSubmit} className="form">
          {Object.keys(formData).map((key) => (
            <input
              key={key}
              type={key === 'email' ? 'email' : 'text'}
              name={key}
              placeholder={key}
              value={formData[key]}
              onChange={handleChange}
            />
          ))}
          <button type="submit">Save</button>
        </form>
      </div>

      <div className="bottom-section">
        <h2>Employee List</h2>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                {Object.keys(formData).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={Object.keys(formData).length}>
                    직원 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    {Object.keys(formData).map((key) => (
                      <td key={key}>{emp[key]}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
