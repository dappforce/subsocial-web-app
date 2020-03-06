import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import { Api } from '@polkadot/react-api';

import Queue from '@polkadot/react-components/Status/Queue';
import Signer from '@polkadot/react-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { Navigation } from './Navigation';
import Connecting from '../components/main/Connecting';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;
  console.log(url);

  return <Queue>
    <Api
      url={url}
    >
      <MyAccountProvider>
        <Signer>
          <Navigation>
            {children}
          </Navigation>
        </Signer>
      </MyAccountProvider>
      <Connecting/>
    </Api>
  </Queue>;
};

export default ClientLayout;
