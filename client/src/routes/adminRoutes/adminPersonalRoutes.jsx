import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../privateRoutes';

import PersonalPhotoPage from '../../pages/admin/personal/PersonalPhotoPage';
import PersonalMusicPage from '../../pages/admin/personal/PersonalMusicPage';
import PersonalMoviePage from '../../pages/admin/personal/PersonalMoviePage';

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

    <Route
    key="personal music"
    path="personal/music"
    element={
      <PrivateRoute role="admin">
        <PersonalMusicPage/>
      </PrivateRoute>
    }
  />,
  

    <Route
    key="personal movie"
    path="personal/movie"
    element={
      <PrivateRoute role="admin">
        <PersonalMoviePage/>
      </PrivateRoute>
    }
  />,

];

export default adminAccountRoutes;
