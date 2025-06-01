// client/src/pages/admin/main/APage.jsx

import React from 'react';
import styles from './APage.module.css';

const APage = () => {
  return (
    <div className={styles.page}>
      <h2>Page A</h2>
      <div className={`${styles.formRow} ${styles.small}`}>
        <p>This is the A page (a 그림 클릭 시 보이는 화면)</p>
        <input type="text" placeholder="샘플 입력" />
        <button type="button">버튼</button>
      </div>
    </div>
  );
};

export default APage;
