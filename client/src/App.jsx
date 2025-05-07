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
          <Route path="/" element={<Layout message={message} />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />

            {/* ✅ admin 전용 페이지 */}
            <Route
              path="admin"
              element={
                <PrivateRoute role="admin">
                  <AdminPage />
                </PrivateRoute>
              }
            />

            {/* ✅ user 전용 페이지 */}
            <Route
              path="user"
              element={
                <PrivateRoute role="user">
                  <UserPage />
                </PrivateRoute>
              }
            />

            {/* ✅ 404 Not Found 페이지 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
