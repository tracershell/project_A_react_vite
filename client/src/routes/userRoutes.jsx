// src/routes/userRoutes.js
import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import UserPage from '../pages/user/UserPage';

const userRoutes = [
  // ✅ user 전용 페이지 → /user 접근 시 UserPage 렌더링
  <Route
    key="user"
    path="user"
    element={
      <PrivateRoute role="user">
        <UserPage />
      </PrivateRoute>
    }
  />
];

export default userRoutes;
