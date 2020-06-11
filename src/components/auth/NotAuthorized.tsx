import React from 'react';
import NoData from '../utils/EmptyList';
import { AuthorizationPanel } from './AuthorizationPanel';

export const NotAuthorized = () =>
  <NoData description='Only logged in users can access this page'>
    <AuthorizationPanel />
  </NoData>

export default NotAuthorized
