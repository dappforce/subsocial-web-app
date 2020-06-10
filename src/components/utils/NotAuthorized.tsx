import React from 'react';
import NoData from './EmptyList';
import { AuthorizationPanel } from './LogIn';

export const NotAuthorized = () =>
  <NoData description='Only logged in users can access this page'>
    <AuthorizationPanel />
  </NoData>

export default NotAuthorized
