import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';

import PersonalPhotoPage from '../../pages/admin/personal/PersonalPhotoPage';



const adminAccountRoutes = [

  <Route
    key="personal photo"
    path="personal/photo"
    element={
      <PrivateRoute role="admin">
        <PersonalPhotoPage/>
      </PrivateRoute>
    }
  />,

  

];

export default adminAccountRoutes;
