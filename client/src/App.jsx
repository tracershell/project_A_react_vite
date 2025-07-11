// client/src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { HashRouter as Router, Routes, Route } from 'react-router-dom'; // HashRouter 사용
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './context/AuthContext';

// 중첩 라우트 컴포넌트
import AdminRoutes from './routes/adminRoutes';
import UserRoutes from './routes/userRoutes';
import FamilyRoutes from './routes/familyRoutes';
import PersonalRoutes from './routes/personalRoutes';

console.log('✅ App.jsx loaded');

function App() {
  const [message, setMessage] = useState('Loading...');

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ─────────────────────────────────────────────
              Layout 바깥이 아닌 안쪽에 Admin/User 를 포함
          ───────────────────────────────────────────── */}
          <Route path="/" element={<Layout message={message} />}>
            {/* public 페이지 */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* admin 하위 모든 경로 → AdminRoutes */}
            <Route path="admin/*" element={<AdminRoutes />} />

            {/* user 하위 모든 경로 → UserRoutes */}
            <Route path="user/*" element={<UserRoutes />} />

            {/* personal 하위 모든 경로 → PersonalRoutes */}

            <Route path="personal/*" element={<PersonalRoutes />} />

            <Route path="family/*" element={<FamilyRoutes />} />

            <Route path="personal/*" element={<PersonalRoutes />} />

            {/* catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
