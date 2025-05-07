// src/pages/user/UserPage.jsx
import styles from './UserPage.module.css';

const UserPage = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User Page</h2>
      <p>사용자 전용 기능들을 여기에 구성합니다.</p>
    </div>
  );
};

export default UserPage;
