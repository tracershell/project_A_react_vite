import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './privateRoutes';

import PersonalPage from '../pages/personal/PersonalPage';

// import adminMainRoutes from './adminMainRoutes';
import adminAccountRoutes from './adminRoutes/adminAccountRoutes';
import adminEmployeesRoutes from './adminRoutes/adminEmployeesRoutes';
import adminImportRoutes from './adminImportRoutes';
import adminGeneralRoutes from './adminRoutes/adminGeneralRoutes';
import adminPayrollRoutes from './adminRoutes/adminPayrollRoutes';
// --------------------------------------------------------------
import adminPersonalRoutes from './adminRoutes/adminPersonalRoutes';


console.log('✅ PersonalMainRoutes import 확인'); // ← 이건 찍히는지 먼저 확인

export default function personalRoutes() {
  return (
    <Routes>
      {/* /personal */}
      <Route
        index
        element={
          <PrivateRoute role="personal">
            <PersonalPage />
          </PrivateRoute>
        }
      />

      {/* /pull down menu router 를 위한 공간 */}


      {/* catch-all */}
      <Route
        path="*"
        element={
          <div style={{ padding: 20 }}>
            <h2>Personal Page Not Found</h2>
          </div>
        }
      />
    </Routes>
  );
}
