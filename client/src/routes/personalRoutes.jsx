import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './privateRoutes';


// personal 전용 페이지
import PersonalPage from '../pages/personal/PersonalPage';

// personal menu 페이지
import personalStudyRoutes from './personalRoutes/personalStudyRoutes';



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

      {/* /study/... */}
      {personalStudyRoutes}


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
