import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// 나중에 admin/general 아래에 페이지가 생기면 추가하세요.
const adminGeneralRoutes = [
  // <Route
  //   key="admin-general-foo"
  //   path="general/foo"
  //   element={ <PrivateRoute role="admin"><FooPage/></PrivateRoute> }
  // />,
];

export default adminGeneralRoutes;
