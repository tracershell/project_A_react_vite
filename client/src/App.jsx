import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/login/LoginPage';
import AdminPage from './pages/admin/AdminPage';
import UserPage from './pages/user/UserPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

// ✅ RegisterPage import 추가 (경로 맞게 수정하세요!)
import RegisterPage from './pages/register/RegisterPage';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('API 요청 실패'));
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ✅ Layout 안에 모든 페이지 포함 → 공통 header/footer 적용 */}
          <Route path="/" element={<Layout message={message} />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />

            {/* ✅ admin 전용 페이지 → /admin 접근 시 AdminPage 렌더링 */}
            <Route
              path="admin"
              element={
                <PrivateRoute role="admin">
                  <AdminPage />
                </PrivateRoute>
              }
            />

            {/* ✅ user 전용 페이지 → /user 접근 시 UserPage 렌더링 */}
            <Route
              path="user"
              element={
                <PrivateRoute role="user">
                  <UserPage />
                </PrivateRoute>
              }
            />

            {/* ✅ Register 페이지 (admin이 접근할 때 사용됨) */}
            <Route path="register" element={<RegisterPage />} />

            {/* ✅ 404 Not Found 페이지 → 위에서 매칭 안 되면 이걸 렌더링 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
