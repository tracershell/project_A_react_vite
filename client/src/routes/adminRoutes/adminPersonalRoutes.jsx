import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';

import PersonalPhotoPage from '../../pages/admin/personal/PersonalPhotoPage';
import PersonalMusicPage from '../../pages/admin/personal/PersonalMusicPage';


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
  

];

export default adminAccountRoutes;
