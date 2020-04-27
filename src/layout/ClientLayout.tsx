import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import Api from '../components/utils/Api'
import { SubsocialApiProvider } from '../components/utils/SubsocialApiContext';
import Queue from '@polkadot/react-components/Status/Queue';
import Signer from '@polkadot/react-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import Connecting from '../components/main/Connecting';
import { BlockAuthors, Events } from '@polkadot/react-query';
import ConnectingOverlay from '../components/main//overlays/Connecting';
import { getEnv } from '../components/utils/utils';
import { NotifCounterProvider } from '../components/utils/NotifCounter';
import { Content } from '../components/main/Content';

import { isServerSide } from 'src/components/utils';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = getEnv('SUBSTRATE_URL') || settings.apiUrl || undefined;

  return isServerSide()
    ? <Content>
      {children}
    </Content>
    : <Queue>
      <Api url={url}>
        <SubsocialApiProvider>
          <BlockAuthors>
            <Events>
              <MyAccountProvider>
                <NotifCounterProvider>
                  <Signer>
                    <Content>
                      {children}
                    </Content>
                  </Signer>
                  <ConnectingOverlay />
                </NotifCounterProvider>
              </MyAccountProvider>
              <Connecting />
            </Events>
          </BlockAuthors>
        </SubsocialApiProvider>
      </Api>
    </Queue>;
};

export default ClientLayout;
