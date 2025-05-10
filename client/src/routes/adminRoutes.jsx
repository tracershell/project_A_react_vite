import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import AdminPage from '../pages/admin/AdminPage';
import adminMainRoutes from './adminMainRoutes';
import adminEmployeesRoutes from './adminEmployeesRoutes';
import adminGeneralRoutes from './adminGeneralRoutes';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* /admin */}
      <Route
        index
        element={
          <PrivateRoute role="admin">
            <AdminPage />
          </PrivateRoute>
        }
      />

      {/* /admin/main/... */}
      {adminMainRoutes}

      {/* /admin/employees/... */}
      {adminEmployeesRoutes}

      {/* /admin/general/... (비어 있어도 괜찮습니다) */}
      {adminGeneralRoutes}

      {/* /admin/* 아닌 잘못된 URL → 404 */}
      <Route
        path="*"
        element={<div>Admin Page Not Found</div>}
      />
    </Routes>
  );
}
