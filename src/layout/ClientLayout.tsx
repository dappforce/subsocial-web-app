import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import Api from '../components/utils/Api'
import { SubsocialApiProvider } from '../components/utils/SubsocialApiContext';
import Queue from '@subsocial/react-components/Status/Queue';
import Signer from '@subsocial/react-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { BlockAuthors, Events } from '@subsocial/react-query';
import { substrateUrl } from '../components/utils/env';
import { NotifCounterProvider } from '../components/utils/NotifCounter';
import { Content } from '../components/main/Content';

import { isServerSide } from 'src/components/utils';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = substrateUrl || settings.apiUrl || undefined;

  return isServerSide()
    ? <Content>
      {children}
    </Content>
    : <Queue>
      <MyAccountProvider>
        <Api url={url}>
          <SubsocialApiProvider>
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
          </SubsocialApiProvider>
        </Api>
      </MyAccountProvider>
    </Queue>;
};

export default ClientLayout;
