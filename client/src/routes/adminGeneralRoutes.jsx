import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

import APage from '../pages/admin/general/APage';
import ANewPage from '../pages/admin/general/ANewPage';

const adminGeneralRoutes = [
  <Route
    key="admin-general-apage"
    path="general/a"
    element={
      <PrivateRoute role="admin">
        <APage />
      </PrivateRoute>
    }
  />,
  <Route
    key="admin-general-anewpage"
    path="general/anew"
    element={
      <PrivateRoute role="admin">
        <ANewPage />
      </PrivateRoute>
    }
  />
];

export default adminGeneralRoutes;
