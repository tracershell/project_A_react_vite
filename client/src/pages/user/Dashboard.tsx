// src/pages/user/Dashboard.tsx
import styles from './Dashboard.module.css';

const UserDashboard = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User Dashboard</h2>
      <p>일반 사용자를 위한 기능입니다.</p>
    </div>
  );
};

export default UserDashboard;
