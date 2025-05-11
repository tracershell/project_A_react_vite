import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import AdminPage from '../pages/admin/AdminPage';
import adminMainRoutes from './adminMainRoutes';
import adminEmployeesRoutes from './adminEmployeesRoutes';
import adminGeneralRoutes from './adminGeneralRoutes';

console.log('✅ adminMainRoutes import 확인'); // ← 이건 찍히는지 먼저 확인

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

      {/* catch-all */}
      <Route
        path="*"
        element={
          <div style={{ padding: 20 }}>
            <h2>Admin Page Not Found</h2>
          </div>
        }
      />
    </Routes>
  );
}
