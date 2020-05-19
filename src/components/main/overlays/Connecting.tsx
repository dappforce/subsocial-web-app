// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useApi } from '@subsocial/react-hooks';
import settings from '../../settings';

import BaseOverlay from './Base';
import { Loading } from 'src/components/utils/utils';

const wsUrl = settings.apiUrl;
const isWs = wsUrl.startsWith('ws://');
const isWsLocal = wsUrl.includes('127.0.0.1');
const isHttps = typeof window !== 'undefined' && window.location.protocol.startsWith('https:');

interface Props {
  className?: string;
}

export default function Connecting ({ className }: Props): React.ReactElement<Props> | null {
  const { isApiConnected, isWaitingInjected } = useApi();

  if (isWaitingInjected) {
    return (
      <Loading />
    );
  } else if (!isApiConnected) {
    return (
      <BaseOverlay
        className={className}
        icon='globe'
        type='error'
      >
        <div>{'You are not connected to a node. Ensure that your node is running and that the Websocket endpoint is reachable.'}</div>
        {
          isWs && !isWsLocal && isHttps
            ? <div>{'You are connecting from a secure location to an insecure WebSocket ({{wsUrl}}). Due to browser mixed-content security policies this connection type is not allowed. Change the RPC service to a secure \'wss\' endpoint.'}</div>
            : undefined
        }
      </BaseOverlay>
    );
  }

  return null;
}
