import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import APage from '../pages/admin/main/APage';
import BPage from '../pages/admin/main/BPage';
import CPage from '../pages/admin/main/CPage';
import DPage from '../pages/admin/main/DPage';
import EPage from '../pages/admin/main/EPage';

import EPage01 from '../pages/admin/main/epage/EPage-01';
import FPage from '../pages/admin/main/FPage';
import FPageView from '../pages/admin/main/FPageView';

const adminMainRoutes = [
  <Route
    key="admin-main-a"
    path="main/a"
    element={
      <PrivateRoute role="admin">
        <APage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-b"
    path="main/b"
    element={
      <PrivateRoute role="admin">
        <BPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-c"
    path="main/c"
    element={
      <PrivateRoute role="admin">
        <CPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-d"
    path="main/d"
    element={
      <PrivateRoute role="admin">
        <DPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-e"
    path="main/e"
    element={
      <PrivateRoute role="admin">
        <EPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-e-e01"
    path="main/e/e01"
    element={
      <PrivateRoute role="admin">
        <EPage01 />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-f"
    path="main/f"
    element={
      <PrivateRoute role="admin">
        <FPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-main-f"
    path="admin/main/fpageview/:id"
    element={
      <PrivateRoute role="admin">
        <FPageView />
      </PrivateRoute>
    }
  />
];

export default adminMainRoutes;
