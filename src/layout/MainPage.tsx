import React from 'react';
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { Navigation } from './Navigation';
import dynamic from 'next/dynamic';
const ClientLayout = dynamic(() => import('./ClientLayout'), { ssr: false });
import settings from '../components/settings';
import { Api } from '@polkadot/ui-api';
import { registerSubsocialTypes } from '../components/types';

type LayoutProps = {
  isClient: boolean
};
const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;

const ServerLayout: React.FunctionComponent = ({ children }) => (
  <Api
    queueExtrinsic={{} as any}
    queueSetTxStatus={{} as any}
    url={url}
  >
  <SidebarCollapsedProvider>
    <Navigation>
      {children}
    </Navigation>
  </SidebarCollapsedProvider>
  </Api>
);

const NextLayout: React.FunctionComponent<LayoutProps> = ({ children, isClient }) => {

  console.log('Web socket url=', url);

  registerSubsocialTypes();

  return <div id='root'>
    {isClient
      ? <ClientLayout>{children}</ClientLayout>
      : <ServerLayout>{children}</ServerLayout>}
  </div>;
};

export default NextLayout;
