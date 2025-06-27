// src/routes/familyRoutes/familyAlexisRoutes.jsx

import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../privateRoutes';

import AlexisPhotoPage from '../../pages/family/alexis/AlexisPhotoPage';




const familyAlexisRoutes = [

  <Route
    key="alexis photo"
    path="alexis/photo"
    element={
      <PrivateRoute role="family">
        <AlexisPhotoPage />
      </PrivateRoute>
    }
  />,


];

export default familyAlexisRoutes;
