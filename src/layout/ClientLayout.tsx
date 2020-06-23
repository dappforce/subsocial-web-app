import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import Api from '../components/utils/Api'
import { SubsocialApiProvider } from '../components/utils/SubsocialApiContext';
import Queue from '@subsocial/react-components/Status/Queue';
import Signer from '@subsocial/react-signer';
import { MyAccountProvider } from '../components/auth/MyAccountContext';
import { Events } from '@subsocial/react-query';
import { substrateUrl } from '../components/utils/env';
import { NotifCounterProvider } from '../components/utils/NotifCounter';
import { Content } from '../components/main/Content';
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { AuthProvider } from 'src/components/auth/AuthContext';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = substrateUrl || settings.apiUrl || undefined;

  return <Queue>
    <SidebarCollapsedProvider>
      <MyAccountProvider>
        <Api url={url}>
          <SubsocialApiProvider>
            <AuthProvider>
              <Events>
                <NotifCounterProvider>
                  <Signer>
                    <Content>
                      {children}
                    </Content>
                  </Signer>
                </NotifCounterProvider>
              </Events>
            </AuthProvider>
          </SubsocialApiProvider>
        </Api>
      </MyAccountProvider>
    </SidebarCollapsedProvider>
  </Queue>;
};

export default ClientLayout;
