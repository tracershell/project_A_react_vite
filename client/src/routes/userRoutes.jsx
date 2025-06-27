import React from 'react';
import { Routes, Route } from 'react-router-dom';


import UserPage from '../pages/user/UserPage';

export default function UserRoutes() {
  return (
    <Routes>
      {/* /user */}
      <Route
        index
        element={
          <PrivateRoute role="user">
            <UserPage />
          </PrivateRoute>
        }
      />

      {/* /user/* 아닌 잘못된 URL → 404 */}
      <Route
        path="*"
        element={<div>User Page Not Found</div>}
      />
    </Routes>
  );
}
