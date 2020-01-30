import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import { Api } from '@polkadot/ui-api';

import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import Queue from '@polkadot/ui-app/Status/Queue';
import Signer from '../components/ui-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { QueueProps } from '@polkadot/ui-app/Status/types';
import Status from '../components/main/Status';
import { Navigation } from './Navigation';
import Connecting from '../components/main/Connecting';

export type LayoutProps = {
  isClient: boolean
};

const ClientLayout: React.FunctionComponent<LayoutProps> = ({ children, isClient }) => {
  const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;

  return <Queue>
        <QueueConsumer>
        {({ queueExtrinsic, queueSetTxStatus }) => {
          return (
            <Api
                queueExtrinsic={queueExtrinsic}
                queueSetTxStatus={queueSetTxStatus}
                url={url}
            >
            <MyAccountProvider>
                <QueueConsumer>
                    {({ queueAction, stqueue, txqueue }: QueueProps) => (
                        <Navigation>
                            <Signer>
                            <Status
                                queueAction={queueAction}
                                stqueue={stqueue}
                                txqueue={txqueue}
                            />
                            </Signer>
                            {children}
                        </Navigation>
                    )}
                </QueueConsumer>
                </MyAccountProvider>
                <Connecting/>
            </Api>
          );
        }}
        </QueueConsumer>
    </Queue>;
};

export default ClientLayout;
