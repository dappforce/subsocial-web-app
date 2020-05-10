
import { I18nProps } from '@subsocial/react-components/types';
import { ApiProps } from '@subsocial/react-api/types';

import React from 'react';
import styled from 'styled-components';
import { withApi, withMulti } from '@subsocial/react-api';
import settings from '../settings';
type Props = I18nProps & ApiProps;

const Wrapper = styled.div`
  background: red;
  color: white;
  bottom: 0;
  left: 0;
  line-height: 1.5em;
  opacity: 0.9;
  padding: 1em 5em;
  position: fixed;
  right: 0;
  text-align: center;
`;

// @ts-ignore
const isFirefox = typeof InstallTrigger !== 'undefined';

class Connecting extends React.PureComponent<Props> {
  public render () {
    const { isApiConnected } = this.props;

    if (process) return <></>;

    if (isApiConnected) {
      return <Wrapper />;
    }

    const wsUrl = settings.apiUrl;
    const isWs = wsUrl.indexOf('ws://') === 0;
    const isWsRemote = wsUrl.indexOf('127.0.0.1') === -1;
    const isHttps = window.location.protocol.indexOf('https:') === 0;

    return (
      <Wrapper>
        <div>{'You are not connected to a node. Ensure that your node is running and that the Websocket endpoint is reachable.'}</div>
        {
          isFirefox && isWs
            ? <div>{'With the Firefox browser connecting to insecure WebSockets ({{wsUrl}}) will fail due to the browser not allowing localhost access from a secure site.'}</div>
            : undefined
        }
        {
          isWs && isWsRemote && isHttps
            ? <div>{`You are connecting from a secure location to an insecure WebSocket ({{wsUrl}}). Due to browser mixed-content security policies this connection type is not allowed. Change the RPC service to a secure 'wss' endpoint.`}</div>
            : undefined
        }
      </Wrapper>
    );
  }
}

export default withMulti(
  Connecting,
  withApi
);
