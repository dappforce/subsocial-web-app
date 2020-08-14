import React from 'react';
import { SubsocialApiProvider } from '../components/utils/SubsocialApiContext';
import { MyAccountProvider } from '../components/auth/MyAccountContext';
import { Navigation } from './Navigation'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { AuthProvider } from '../components/auth/AuthContext';
import { SubstrateProvider, SubstrateWebConsole } from '../components/substrate';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  return (
    <SidebarCollapsedProvider>
      <SubstrateProvider>
        <SubstrateWebConsole />
        <SubsocialApiProvider>
          <MyAccountProvider>
            <AuthProvider>
              <Navigation>
                {children}
              </Navigation>
            </AuthProvider>
          </MyAccountProvider>
        </SubsocialApiProvider>
      </SubstrateProvider>
    </SidebarCollapsedProvider>
  )
};

export default ClientLayout;
