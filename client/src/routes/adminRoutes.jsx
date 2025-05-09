// src/routes/adminRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import AdminPage from '../pages/admin/AdminPage';
import adminMainRoutes from './adminMainRoutes';
import adminEmployeesRoutes from './adminEmployeesRoutes';
import adminGeneralRoutes from './adminGeneralRoutes';

const adminRoutes = [
  // ✅ admin 전용 페이지 → /admin 접근 시 AdminPage 렌더링
  <Route
    key="admin"
    path="admin"
    element={
      <PrivateRoute role="admin">
        <AdminPage />
      </PrivateRoute>
    }
  />,
  ...adminMainRoutes,
  ...adminEmployeesRoutes,
  ...adminGeneralRoutes
];

export default adminRoutes;
