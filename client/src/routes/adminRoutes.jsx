import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './privateRoutes';

// Admin 전용 페이지
import AdminPage from '../pages/admin/AdminPage';

// admin menu 페이지
import adminMainRoutes from './adminMainRoutes';
import adminAccountRoutes from './adminRoutes/adminAccountRoutes';
import adminEmployeesRoutes from './adminRoutes/adminEmployeesRoutes';
import adminImportRoutes from './adminImportRoutes';
import adminGeneralRoutes from './adminRoutes/adminGeneralRoutes';
import adminPayrollRoutes from './adminRoutes/adminPayrollRoutes';
// --------------------------------------------------------------
import adminPersonalRoutes from './adminRoutes/adminPersonalRoutes';


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

       {/* /admin/main/... */}
      {adminAccountRoutes}

      {/* /admin/employees/... */}
      {adminEmployeesRoutes}

      {/* /admin/import/... */}
      {adminImportRoutes}

      {/* /admin/payroll/... */}
      {adminPayrollRoutes}

      {/* /admin/general/... (비어 있어도 괜찮습니다) */}
      {adminGeneralRoutes}

      {/* /admin/personal/... */}
      {adminPersonalRoutes}


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
