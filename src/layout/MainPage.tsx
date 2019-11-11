import React, { useState } from 'react';

import settings from '../components/settings';
import '@polkadot/ui-app/i18n';
import '../components/utils/styles';

import dynamic from 'next/dynamic';
const Suspense = dynamic(() => import('../components/utils/Suspense'), { ssr: false });
import store from 'store';
import { getTypeRegistry } from '@polkadot/types';
import { Api } from '@polkadot/ui-api';

import { QueueConsumer } from '@polkadot/ui-app/Status/Context';
import Queue from '@polkadot/ui-app/Status/Queue';
import { registerSubsocialTypes } from '../components/types';
const Connecting = dynamic(() => import('../components/main/Connecting'), { ssr: false });
import Menu from './SideMenu';
import Signer from '../components/ui-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import styled from 'styled-components';
import { QueueProps } from '@polkadot/ui-app/Status/types';
import Status from '../components/main/Status';
import { Grid } from 'semantic-ui-react';
import TopMenu from './TopMenu';
import { ReactiveBase } from '@appbaseio/reactivesearch';

const WrapperConnent = styled.div`
  background: #fafafa;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  padding: 0 2rem;

  @media(max-width: 768px) {
    padding: 0 0.5rem;
  }
`;
type Props = {
  children: React.ReactNode
};

const SideMenu = (props: Props) => {
  const [ collapsed, setCollapsed ] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  return <ReactiveBase
    url='http://localhost:9200'
    app='subsocial_blogs'
  >
    <TopMenu toggleCollapsed={toggleCollapsed} collapsed={collapsed}/>
    <Grid>
      <Grid.Column width={collapsed ? 1 : 3}>
        <Menu collapsed={collapsed} />
      </Grid.Column>

      <Grid.Column stretched width={9}>
        {props.children}
      </Grid.Column>
    </Grid>
  </ReactiveBase>;
};

const NextLayout: React.FunctionComponent<any> = ({ children }) => {
  const url = process.env.WS_URL || settings.apiUrl || undefined;

  console.log('Web socket url=', url);

  try {
    registerSubsocialTypes();
    const types = store.get('types') || {};
    const names = Object.keys(types);

    if (names.length) {
      getTypeRegistry().register(types);
      console.log('Type registration:', names.join(', '));
    }
  } catch (error) {
    console.error('Type registration failed', error);
  }
  return <div id='root'>
    <Suspense fallback='...'>
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
                  <Signer>
                    <SideMenu>
                      <WrapperConnent>
                        <QueueConsumer>
                          {({ queueAction, stqueue, txqueue }: QueueProps) => (
                            <>
                              {children}
                              <Status
                                queueAction={queueAction}
                                stqueue={stqueue}
                                txqueue={txqueue}
                              />
                            </>
                          )}
                        </QueueConsumer>
                      </WrapperConnent>
                    </SideMenu>
                  </Signer>
                </MyAccountProvider>
                <Connecting />
              </Api>
            );
          }}
        </QueueConsumer>
      </Queue>
    </Suspense>;
  </div>;
};

export default NextLayout;
