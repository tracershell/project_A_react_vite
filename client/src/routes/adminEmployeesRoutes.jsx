// src/routes/adminMainRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import EmployeesListPage from '../pages/admin/employees/EmployeesListPage';


const adminMainRoutes = [
  <Route
    key="admin-employees-employees"
    path="admin/employees/employees"
    element={
      <PrivateRoute role="admin">
        <EmployeesListPage />
      </PrivateRoute>
    }
  />
  
];

export default adminMainRoutes;
