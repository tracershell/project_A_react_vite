import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';

import EmployeesPage from '../../pages/admin/employees/EmployeesPage';
import EmployeesListPage from '../../pages/admin/employees/EmployeesListPage';
import EmployeesPrintPage from '../../pages/admin/employees/EmployeesPrintPage';
import EmployeesDataPage from '../../pages/admin/employees/EmployeesDataPage';
import EmployeesPhotoPage from '../../pages/admin/employees/EmployeesPhotoPage';

const adminEmployeesRoutes = [

  <Route
    key="admin-employees"
    path="employees/main"
    element={
      <PrivateRoute role="admin">
        <EmployeesPage />
      </PrivateRoute>
    }
  />,

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
  />,

  <Route
    key="admin-employees-data"
    path="employees/employeesdata"
    element={
      <PrivateRoute role="admin">
        <EmployeesDataPage />
      </PrivateRoute>
    }
  />,
  
  <Route
    key="admin-employees-photo"
    path="employees/employeesphoto"
    element={
      <PrivateRoute role="admin">
        <EmployeesPhotoPage />
      </PrivateRoute>
    }
  />
];

export default adminEmployeesRoutes;
