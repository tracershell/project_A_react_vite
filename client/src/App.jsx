import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/login/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/register/RegisterPage';
import { AuthProvider } from './context/AuthContext';

// 👉 admin/user routes import
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';

function App() {
  const [message, setMessage] = useState('Loading...');

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout message={message} />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            {/* ✅ admin routes 추가 */}
            {adminRoutes}
            {/* ✅ user routes 추가 */}
            {userRoutes}
            {/* ✅ Register, 404 페이지 */}
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
