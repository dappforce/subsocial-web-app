import React from 'react';

import settings from '../components/settings';
import '@polkadot/ui-app/i18n';
import '../components/utils/styles';

import Suspense from '../components/utils/Suspense';
import { Api } from '@polkadot/ui-api';

import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import Queue from '@polkadot/ui-app/Status/Queue';
import Signer from '../components/ui-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { QueueProps } from '@polkadot/ui-app/Status/types';
import Status from '../components/main/Status';
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { Navigation } from './Navigation';

const ClientLayout: React.FunctionComponent = ({ children }) => {
  const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;

  return <Suspense fallback='...'>
    <Queue>
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
                        <SidebarCollapsedProvider>
                            <Navigation>
                                <Signer>
                                {children}
                                <Status
                                    queueAction={queueAction}
                                    stqueue={stqueue}
                                    txqueue={txqueue}
                                />
                                </Signer>
                            </Navigation>
                        </SidebarCollapsedProvider>
                    )}
                </QueueConsumer>
                </MyAccountProvider>
            </Api>
          );
        }}
        </QueueConsumer>
    </Queue>
</Suspense>;
};

export default ClientLayout;
