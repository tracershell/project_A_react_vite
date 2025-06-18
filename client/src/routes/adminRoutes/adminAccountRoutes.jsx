import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';

import AccountCreditCardPage from '../../pages/admin/account/AccountCreditCardPage';
import AccountCcPayPage from '../../pages/admin/account/AccountCcPayPage';
import AccountCcItemPage from '../../pages/admin/account/AccountCcItemPage';
import AccountCcHolderPage from '../../pages/admin/account/AccountCcHolderPage';
import AccountPettyMoneyPage from '../../pages/admin/account/AccountPettyMoneyPage';

const adminAccountRoutes = [

    <Route
    key="creditcard"
    path="account/ccsummary"
    element={
      <PrivateRoute role="admin">
        <AccountCreditCardPage />
      </PrivateRoute>
    }
  />,


  <Route
    key="creditcardpay-input"
    path="account/ccpayinput"
    element={
      <PrivateRoute role="admin">
        <AccountCcPayPage />
      </PrivateRoute>
    }
  />,

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
    

  <Route
    key="pettymoneyledger"
    path="account/pettymoneyledger"
    element={
      <PrivateRoute role="admin">
        <AccountPettyMoneyPage />
      </PrivateRoute>
    }
  />,
  
];

export default adminAccountRoutes;
