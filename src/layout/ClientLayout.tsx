import React from 'react';
import '../components/utils/styles';
import { SubsocialApiProvider } from '../components/utils/SubsocialApiContext';
import { MyAccountProvider } from '../components/auth/MyAccountContext';
import { Navigation } from './Navigation'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { AuthProvider } from '../components/auth/AuthContext';
import { SubstrateProvider, SubstrateWebConsole } from '../components/substrate';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  return (
    <SidebarCollapsedProvider>
      <MyAccountProvider>
        <SubstrateProvider>
          <SubstrateWebConsole />
          <SubsocialApiProvider>
            <AuthProvider>
              <Navigation>
                {children}
              </Navigation>
            </AuthProvider>
          </SubsocialApiProvider>
        </SubstrateProvider>
      </MyAccountProvider>
    </SidebarCollapsedProvider>
  )
};

export default ClientLayout;
