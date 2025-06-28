import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../privateRoutes';


import StudyMusicPage from '../../pages/personal/study/StudyMusicPage';


const personalStudyRoutes = [

  <Route
    key="study music"
    path="study/music"
    element={
      <PrivateRoute role="personal">
        <StudyMusicPage />
      </PrivateRoute>
    }
  />,


];

export default personalStudyRoutes;
