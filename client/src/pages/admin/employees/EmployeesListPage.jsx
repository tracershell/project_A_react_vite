// /client/src/pages/admin/employees/EmployeesListPage.jsx
import React, { useEffect, useState } from 'react';
import styles from './EmployeesListPage.module.css';
import axios from 'axios';

const EmployeesListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({});
  const [selectedEid, setSelectedEid] = useState('');

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
    setForm({});
  };

  const handleEdit = async () => {
    await axios.post(`/api/admin/employees/employeeslistpage/edit/${form.eid}`, form);
    fetchEmployees();
  };

  const handleDelete = async () => {
    await axios.post(`/api/admin/employees/employeeslistpage/delete/${form.eid}`);
    fetchEmployees();
  };

  const selectEmployee = (eid) => {
    const emp = employees.find((emp) => emp.eid === eid);
    if (emp) setForm(emp);
  };

  return (
    <div className={styles.page}>
      <h2>Employee Management</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input name="eid" value={form.eid || ''} onChange={handleChange} placeholder="EID" />
        <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Name" />
        <input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email" />
        <button type="submit">Add</button>
        <button type="button" onClick={handleEdit}>Edit</button>
        <button type="button" onClick={handleDelete}>Delete</button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th><th>EID</th><th>Name</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id} onClick={() => selectEmployee(emp.eid)}>
              <td>{emp.id}</td>
              <td>{emp.eid}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeesListPage;
