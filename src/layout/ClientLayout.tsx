import React, { useContext } from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import { Api } from '@polkadot/react-api';

import StatusContext from '@polkadot/react-components/Status/Context';
import Queue from '@polkadot/react-components/Status/Queue';
import Signer from '@polkadot/react-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { QueueProps } from '@polkadot/react-components/Status/types';
import Status from '../components/main/Status';
import { Navigation } from './Navigation';
import Connecting from '../components/main/Connecting';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);
  console.log(url);

  return <Queue>
    <Api
      url={url}
    >
      <MyAccountProvider>
        <Signer>
          <Status
            queueAction={queueAction}
            stqueue={stqueue}
            txqueue={txqueue}
          />
        </Signer>
        <Navigation>
          {children}
        </Navigation>
      </MyAccountProvider>
      <Connecting/>
    </Api>
  </Queue>;
};

export default ClientLayout;
