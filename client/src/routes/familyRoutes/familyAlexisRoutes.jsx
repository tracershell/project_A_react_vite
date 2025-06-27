// src/routes/familyRoutes/familyAlexisRoutes.jsx

import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../privateRoutes';

import AlexisPhotoPage from '../../pages/family/alexis/AlexisPhotoPage';
import AlexisMoviePage from '../../pages/family/alexis/AlexisMoviePage';



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

  <Route
    key="alexis movie"
    path="alexis/movie"
    element={
      <PrivateRoute role="family">
        <AlexisMoviePage />
      </PrivateRoute>
    }
  />,


];

export default familyAlexisRoutes;
