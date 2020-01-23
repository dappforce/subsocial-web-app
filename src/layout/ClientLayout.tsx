import React from 'react';

import settings from '../components/settings';
import '../components/utils/styles';

import Api from '../components/main/Api';
// const Api = dynamic(() => import('@polkadot/react-api/Api'), { ssr: false });
import { QueueConsumer } from '@polkadot/react-components/Status/Context';
import Queue from '@polkadot/react-components/Status/Queue';
const Signer = dynamic(() => import('@polkadot/react-signer'), { ssr: false });
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { QueueProps } from '@polkadot/react-components/Status/types';
import Status from '../components/main/Status';
import { Navigation } from './Navigation';
import dynamic from 'next/dynamic';

export type LayoutProps = {
  isClient: boolean
};

const ClientLayout: React.FunctionComponent<LayoutProps> = ({ children }) => {
  const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;

  return <Queue>
    <QueueConsumer>
      {({ queuePayload, queueSetTxStatus }) => (
        <Api
          queuePayload={queuePayload}
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
                </MyAccountProvider>;
          </Api>
          )
        }
      </QueueConsumer>
  </Queue>;
};

export default ClientLayout;
