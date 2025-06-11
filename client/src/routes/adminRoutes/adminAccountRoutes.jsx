import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';



import AccountCcItemPage from '../../pages/admin/account/AccountCcItemPage';
import AccountCcHolderPage from '../../pages/admin/account/AccountCcHolderPage';

const adminAccountRoutes = [

  <Route
    key="creditcarditem-input"
    path="account/cciteminput"
    element={
      <PrivateRoute role="admin">
        <AccountCcItemPage />
      </PrivateRoute>
    }
  />,

  <Route
    key="creditcarditem-input"
    path="account/ccholderinput"
    element={
      <PrivateRoute role="admin">
        <AccountCcHolderPage />
      </PrivateRoute>
    }
  />,
    

];

export default adminAccountRoutes;
