import React from 'react';
import { registerSubsocialTypes } from '../components/types';

import '../components/utils/styles';
// import dynamic from 'next/dynamic';
import ClientLayout, { LayoutProps } from './ClientLayout';
// const ClientLayout = dynamic(() => import('./ClientLayout'));

const NextLayout: React.FunctionComponent<LayoutProps> = ({ children, isClient }) => {
  registerSubsocialTypes();

  return <ClientLayout isClient={isClient}>{children}</ClientLayout>;
};

export default NextLayout;
