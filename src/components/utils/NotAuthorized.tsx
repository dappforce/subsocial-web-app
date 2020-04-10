import React from 'react';
import NoData from './EmptyList';
import LogInButton from './LogIn';

export const NotAuthorized = () =>
  <NoData description='Only logged in users can access this page'>
    <LogInButton/>
  </NoData>

export default NotAuthorized
