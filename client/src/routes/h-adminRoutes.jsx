// src/routes/adminRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import AdminPage from '../pages/admin/AdminPage';
import APage from '../pages/admin/main/APage';
import BPage from '../pages/admin/main/BPage';
import CPage from '../pages/admin/main/CPage';
import EPage from '../pages/admin/main/EPage';
import EPage01 from '../pages/admin/main/epage/EPage-01';

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

  // ✅ admin 전용 페이지의 dropdown menu APage
  <Route
    key="admin-main-a"
    path="admin/main/a"
    element={
      <PrivateRoute role="admin">
        <APage />
      </PrivateRoute>
    }
  />,

  // ✅ admin 전용 페이지의 dropdown menu BPage
  <Route
    key="admin-main-b"
    path="admin/main/b"
    element={
      <PrivateRoute role="admin">
        <BPage />
      </PrivateRoute>
    }
  />,

  // ✅ admin - main - CPage
  <Route
    key="admin-main-c"
    path="admin/main/c"
    element={
      <PrivateRoute role="admin">
        <CPage />
      </PrivateRoute>
    }
  />,

  // ✅ admin - main - EPage
  <Route
    key="admin-main-e"
    path="admin/main/e"
    element={
      <PrivateRoute role="admin">
        <EPage />
      </PrivateRoute>
    }
  />,

  // ✅ admin - main - epage - EPage-01 (추가됨)
  <Route
    key="admin-main-e-e01"
    path="admin/main/e/e01"
    element={
      <PrivateRoute role="admin">
        <EPage01 />
      </PrivateRoute>
    }
  />
];

export default adminRoutes;
