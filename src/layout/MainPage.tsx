import React from 'react';
import { Navigation } from './Navigation';
import settings from '../components/settings';
import { Api } from '@polkadot/ui-api';
import { registerSubsocialTypes } from '../components/types';
import { useRouter } from 'next/router';
import { pageListForSsr } from '../config/ssrConfig';

import '../components/utils/styles';

import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import Queue from '@polkadot/ui-app/Status/Queue';
import Signer from '../components/ui-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { QueueProps } from '@polkadot/ui-app/Status/types';
import Status from '../components/main/Status';

type LayoutProps = {
  isClient: boolean
};

const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;

const ClientLayout: React.FunctionComponent<LayoutProps> = ({ children, isClient }) => {

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
            </Api>
          );
        }}
        </QueueConsumer>
    </Queue>;
};

const NextLayout: React.FunctionComponent<LayoutProps> = ({ children, isClient }) => {

  console.log('Web socket url=', url);

  registerSubsocialTypes();

  const page = useRouter().pathname.split('/')[1];

  const withSsr = pageListForSsr.includes(page);

  console.log(withSsr);

  return <div id='root'>
    <ClientLayout isClient={isClient}>{children}</ClientLayout>
  </div>;
};

export default NextLayout;
