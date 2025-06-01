import React, { useState } from 'react';
import axios from 'axios';
import styles from './BPage.module.css';

const BPage = () => {
  const [dateValue, setDateValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [nameValue, setNameValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/main/bpage/add', {
        date_value: dateValue,
        number_value: numberValue,
        name_value: nameValue,
      });
      alert('저장되었습니다.');
      setDateValue('');
      setNumberValue('');
      setNameValue('');
    } catch (err) {
      console.error('저장 실패:', err);
      alert('저장 실패');
    }
  };

  return (
    <div className={styles.page}>
      <h2>B Page - DB 입력</h2>
      <form onSubmit={handleSubmit}>
        <div className={`${styles.formRow} ${styles.small}`}>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            required
          />
          <input
            type="number"
            value={numberValue}
            onChange={(e) => setNumberValue(e.target.value)}
            placeholder="숫자 입력"
            required
          />
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="이름 입력"
            required
          />
          <button type="submit">저장</button>
        </div>
      </form>
    </div>
  );
};

export default BPage;
