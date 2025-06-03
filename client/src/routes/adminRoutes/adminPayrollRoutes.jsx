import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';



import PayrollTaxPage from '../../pages/admin/payroll/PayrollTaxPage';
import PayrollTaxAuditPage from '../../pages/admin/payroll/PayrollTaxAuditPage';



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

  <Route
    key="payroll-taxaudit"
    path="payroll/taxaudit"
    element={
      <PrivateRoute role="admin">
        <PayrollTaxAuditPage />
      </PrivateRoute>
    }
  />,
];

export default adminPayrollRoutes;
