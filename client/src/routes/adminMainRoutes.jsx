// src/routes/adminMainRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import APage from '../pages/admin/main/APage';
import BPage from '../pages/admin/main/BPage';
import CPage from '../pages/admin/main/CPage';
import EPage from '../pages/admin/main/EPage';
import EPage01 from '../pages/admin/main/epage/EPage-01';

const adminMainRoutes = [
  <Route
    key="admin-main-a"
    path="admin/main/a"
    element={
      <PrivateRoute role="admin">
        <APage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-b"
    path="admin/main/b"
    element={
      <PrivateRoute role="admin">
        <BPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-c"
    path="admin/main/c"
    element={
      <PrivateRoute role="admin">
        <CPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-e"
    path="admin/main/e"
    element={
      <PrivateRoute role="admin">
        <EPage />
      </PrivateRoute>
    }
  />,
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

export default adminMainRoutes;
