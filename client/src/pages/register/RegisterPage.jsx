import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    role: 'user',
    status: 'active',
  });
  const [error, setError] = useState('');

  // input refs
  const passwordRef = useRef();
  const emailRef = useRef();
  const nameRef = useRef();
  const roleRef = useRef();
  const statusRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', formData);
      navigate(location.state?.from || '/admin'); // ← 등록 후 원래 화면 or 대시보드
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleDiscontinue = () => {
    navigate(location.state?.from || '/admin'); // ← 원래 화면 or 대시보드로 이동
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <img src="/logo_origami.png" alt="Docker Logo" className={styles.logo} />
        <h2>Register</h2>

        {error && <div className={styles.loginError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="User name"
            required
            className={styles.inputField}
            value={formData.username}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className={styles.inputField}
            value={formData.password}
            onChange={handleChange}
            ref={passwordRef}
            onKeyDown={(e) => handleKeyDown(e, emailRef)}
          />
          <input
            type="email"
            name="email"
            placeholder="Email (Option)"
            className={styles.inputField}
            value={formData.email}
            onChange={handleChange}
            ref={emailRef}
            onKeyDown={(e) => handleKeyDown(e, nameRef)}
          />
          <input
            type="text"
            name="name"
            placeholder="Name (Option)"
            className={styles.inputField}
            value={formData.name}
            onChange={handleChange}
            ref={nameRef}
            onKeyDown={(e) => handleKeyDown(e, roleRef)}
          />
          <label htmlFor="role" className={styles.label}>Authority</label>
          <select
            name="role"
            id="role"
            className={styles.inputField}
            value={formData.role}
            onChange={handleChange}
            ref={roleRef}
            onKeyDown={(e) => handleKeyDown(e, statusRef)}
          >
            <option value="user">General user</option>
            <option value="admin">Administrator</option>
          </select>
          <label htmlFor="status" className={styles.label}>Status</label>
          <select
            name="status"
            id="status"
            className={styles.inputField}
            value={formData.status}
            onChange={handleChange}
            ref={statusRef}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button type="submit" className={styles.btnPrimary}>Register</button>
          <button type="button" className={styles.btnSecondary} onClick={handleDiscontinue}>Discontinue</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
