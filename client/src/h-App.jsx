import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/login/LoginPage';


import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

// ✅ Admin Pages
import AdminPage from './pages/admin/AdminPage';
// Admin Pages Dropdown menus
import APage from './pages/admin/main/APage';
import BPage from './pages/admin/main/BPage';
import CPage from './pages/admin/main/CPage';
import EPage from './pages/admin/main/EPage';
// EPage - child page
import EPage01 from './pages/admin/main/epage/EPage-01';

// ✅ User Pages
import UserPage from './pages/user/UserPage';
// User Pages Dropdown menus


// ✅ RegisterPage import 추가 (경로 맞게 수정하세요!)
import RegisterPage from './pages/register/RegisterPage';

function App() {
  const [message, setMessage] = useState('Loading...');

  // ✅ 백엔드 API 호출하여 메시지 가져오기 (routing ID : /api/hello)
  // useEffect(() => {
  //   fetch('/api/hello')
  //     .then((res) => res.json())
  //     .then((data) => setMessage(data.message))
  //     .catch(() => setMessage('API 요청 실패'));
  // }, []);

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

            {/* ✅ admin 전용 페이지 의 dropdown menu APage */}
            <Route
              path="admin/main/a"
              element={
                <PrivateRoute role="admin">
                  <APage />
                </PrivateRoute>
              }
            />

            {/* ✅ admin 전용 페이지 의 dropdown menu BPage */}
            <Route
              path="admin/main/b"
              element={
                <PrivateRoute role="admin">
                  <BPage />
                </PrivateRoute>
              }
            />

            {/* ✅ admin - main - CPage */}
            <Route
              path="admin/main/c"
              element={
                <PrivateRoute role="admin">
                  <CPage />
                </PrivateRoute>
              }
            />

            {/* ✅ admin - main - EPage */}
            <Route
              path="admin/main/e"
              element={
                <PrivateRoute role="admin">
                  <EPage />
                </PrivateRoute>
              }
            />

            {/* ✅ admin - main - epage - EPage-01 (추가됨) */}
            <Route
              path="admin/main/e/e01"
              element={
                <PrivateRoute role="admin">
                  <EPage01 />
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