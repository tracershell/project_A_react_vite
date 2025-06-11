import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import ImportVendorsPage from '../pages/admin/import/ImportVendorsPage';
import ImportPoPage from '../pages/admin/import/ImportPoPage';
import ImportDepositPage from '../pages/admin/import/ImportDepositPage';
import ImportBalancePage from '../pages/admin/import/ImportBalancePage';
import ImportExtraItemsPage from '../pages/admin/import/ImportExtraItemsPage'; // ✅ 올바름!




const adminImportRoutes = [
  <Route
    key="import-vendors"
    path="import/vendorinput"
    element={
      <PrivateRoute role="admin">
        <ImportVendorsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="import-po"
    path="import/po"
    element={
      <PrivateRoute role="admin">
        <ImportPoPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="import-deposit"
    path="import/deposit"
    element={
      <PrivateRoute role="admin">
        <ImportDepositPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="import-balance"
    path="import/balance"
    element={
      <PrivateRoute role="admin">
        <ImportBalancePage />
      </PrivateRoute>
    }
  />,
  
  <Route
    key="import-extra-items"
    path="import/extraiteminput"
    element={
      <PrivateRoute role="admin">
        <ImportExtraItemsPage />
      </PrivateRoute>
    }
  />,
];

export default adminImportRoutes;
