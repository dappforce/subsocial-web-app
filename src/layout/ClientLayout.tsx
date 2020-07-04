import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import Api from '../components/utils/Api'
import { SubsocialApiProvider } from '../components/utils/SubsocialApiContext';
// import Queue from '@subsocial/react-components/Status/Queue';
import Signer from '@subsocial/react-signer';
import { MyAccountProvider } from '../components/auth/MyAccountContext';
// import { Events } from '@subsocial/react-query';
import { substrateUrl } from '../components/utils/env';
// import { NotifCounterProvider } from '../components/utils/NotifCounter';
import { Content } from '../components/main/Content';
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { AuthProvider } from 'src/components/auth/AuthContext';
import { SubstrateProvider } from 'src/components/substrate';
import SubstrateWebConsole from 'src/components/substrate/SubstrateWebConsole';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = substrateUrl || settings.apiUrl || undefined;

  return (
    <SidebarCollapsedProvider>
      <MyAccountProvider>
        <Api url={url}> {/* // TODO this should be deleted */}
          <SubstrateProvider>
            <SubstrateWebConsole />
            <SubsocialApiProvider>
              <AuthProvider>
                {/* <Events> */}
                {/* <NotifCounterProvider> */}
                <Signer>
                  <Content>
                    {children}
                  </Content>
                </Signer>
                {/* </NotifCounterProvider> */}
                {/* </Events> */}
              </AuthProvider>
            </SubsocialApiProvider>
          </SubstrateProvider>
        </Api>
      </MyAccountProvider>
    </SidebarCollapsedProvider>
  )
};

export default ClientLayout;
