import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';



import PayrollTaxPage from '../../pages/admin/payroll/PayrollTaxPage';




const adminPayrollRoutes = [
  <Route
    key="payroll-tax"
    path="payroll/tax"
    element={
      <PrivateRoute role="admin">
        <PayrollTaxPage />
      </PrivateRoute>
    }
  />,
];

export default adminPayrollRoutes;
