import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './privateRoutes';

// Family 전용 페이지
import FamilyPage from '../pages/family/FamilyPage';

// family menu 페이지
import familyAlexisRoutes from './familyRoutes/familyAlexisRoutes';



console.log('✅ FamilyRoutes import 확인'); // ← 이건 찍히는지 먼저 확인

export default function familyRoutes() {
  return (
    
    <Routes>
      {/* /family */}
      <Route
        index
        element={
          <PrivateRoute role="family">
            <FamilyPage />
          </PrivateRoute>
        }
      />

      {/* /alexis/main/... */}
      {familyAlexisRoutes}


      {/* catch-all */}
      <Route
        path="*"
        element={
          <div style={{ padding: 20 }}>
            <h2>Family Page Not Found</h2>
          </div>
        }
      />
    </Routes>
  );
}
