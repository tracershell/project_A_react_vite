import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import EmployeesListPage from '../pages/admin/employees/EmployeesListPage';
import EmployeesPrintPage from '../pages/admin/employees/EmployeesPrintPage';

const adminEmployeesRoutes = [
  <Route
    key="admin-employees-list"
    path="employees/employees"
    element={
      <PrivateRoute role="admin">
        <EmployeesListPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-employees-print"
    path="employees/employeesprintpage/print/:eid"
    element={
      <PrivateRoute role="admin">
        <EmployeesPrintPage />
      </PrivateRoute>
    }
  />
];

export default adminEmployeesRoutes;
