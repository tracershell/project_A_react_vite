// src/pages/admin/AdminPage.jsx
import styles from './AdminPage.module.css';

const AdminDashboard = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Admin Dashboard</h2>
      <p>관리자 전용 기능들을 여기에 구성합니다.</p>
    </div>
  );
};

export default AdminDashboard;