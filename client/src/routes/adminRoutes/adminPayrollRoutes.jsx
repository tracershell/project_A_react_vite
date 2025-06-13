import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';



import PayrollTaxPage from '../../pages/admin/payroll/PayrollTaxPage';
import PayrollTaxAuditPage from '../../pages/admin/payroll/PayrollTaxAuditPage';
import PayrollIndividualPage from '../../pages/admin/payroll/PayrollIndividualPage';
import PayrollClassificationPage from '../../pages/admin/payroll/PayrollClassificationPage';
import PayrollSalaryAdjustPage from '../../pages/admin/payroll/PayrollSalaryAdjustPage';
import PayrollSickPage from '../../pages/admin/payroll/PayrollSickPage';
import PayrollSickInputPage from '../../pages/admin/payroll/PayrollSickInputPage';
import PayrollPvInputPage from '../../pages/admin/payroll/PayrollPvInputPage';
import PayrollGivenInputPage from '../../pages/admin/payroll/PayrollGivenInputPage';
import PayrollDocPage from '../../pages/admin/payroll/PayrollDocPage';

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
    path="payroll/taxaudit/audit-search"
    element={
      <PrivateRoute role="admin">
        <PayrollTaxAuditPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payroll-individual"
    path="payroll/taxaudit/individual"
    element={
      <PrivateRoute role="admin">
        <PayrollIndividualPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payroll-classification"
    path="payroll/taxaudit/classification"
    element={
      <PrivateRoute role="admin">
        <PayrollClassificationPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payroll-adjust"
    path="payroll/adjust"
    element={
      <PrivateRoute role="admin">
        <PayrollSalaryAdjustPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payroll-sick"
    path="payroll/sick"
    element={
      <PrivateRoute role="admin">
        <PayrollSickPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payroll-sickinput"
    path="payroll/sickinput"
    element={
      <PrivateRoute role="admin">
        <PayrollSickInputPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payroll-pvinput"
    path="payroll/pvinput"
    element={
      <PrivateRoute role="admin">
        <PayrollPvInputPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payroll-giveninput"
    path="payroll/giveninput"
    element={
      <PrivateRoute role="admin">
        <PayrollGivenInputPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="payrolldoc"
    path="payroll/doc"
    element={
      <PrivateRoute role="admin">
        <PayrollDocPage />
      </PrivateRoute>
    }
  />,


];

export default adminPayrollRoutes;
