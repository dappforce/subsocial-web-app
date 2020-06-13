import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import Api from '../components/utils/Api'
import { SubsocialApiProvider } from '../components/utils/SubsocialApiContext';
import Queue from '@subsocial/react-components/Status/Queue';
import Signer from '@subsocial/react-signer';
import { MyAccountProvider } from '../components/auth/MyAccountContext';
import { BlockAuthors, Events } from '@subsocial/react-query';
import { substrateUrl } from '../components/utils/env';
import { NotifCounterProvider } from '../components/utils/NotifCounter';
import { Content } from '../components/main/Content';

import { isServerSide } from 'src/components/utils';
import { OnBoardingProvider } from 'src/components/onboarding';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = substrateUrl || settings.apiUrl || undefined;

  return isServerSide()
    ? <Content>
      {children}
    </Content>
    : <Queue>
      <Api url={url}>
        <OnBoardingProvider>
          <SubsocialApiProvider>
            <MyAccountProvider>
              <BlockAuthors>
                <Events>
                  <NotifCounterProvider>
                    <Signer>
                      <Content>
                        {children}
                      </Content>
                    </Signer>
                  </NotifCounterProvider>
                </Events>
              </BlockAuthors>
            </MyAccountProvider>
          </SubsocialApiProvider>
        </OnBoardingProvider>
      </Api>
    </Queue>;
};

export default ClientLayout;
