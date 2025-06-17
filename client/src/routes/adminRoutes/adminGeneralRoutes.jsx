import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';


import GeneralEnvelopePage from '../../pages/admin/general/GeneralEnvelopePage';
import GeneralEnvelopeInputPage from '../../pages/admin/general/GeneralEnvelopeInputPage';


const adminPayrollRoutes = [

   <Route
    key="general_Envelope"
    path="general/envelope"
    element={
      <PrivateRoute role="admin">
        <GeneralEnvelopePage />
      </PrivateRoute>
    }
  />,


  <Route
    key="general_Envelope_input"
    path="general/envelope_input"
    element={
      <PrivateRoute role="admin">
        <GeneralEnvelopeInputPage />
      </PrivateRoute>
    }
  />,



];

export default adminPayrollRoutes;
