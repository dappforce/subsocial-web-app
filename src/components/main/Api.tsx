 
// Copyright 2017-2019 @polkadot/react-api authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { ChainProperties } from '@polkadot/types/interfaces';
import { QueueTxPayloadAdd, QueueTxMessageSetStatus } from '@polkadot/react-components/Status/types';
import { Prefix } from '@polkadot/util-crypto/address/types';
import { ApiProps } from '@polkadot/react-api/types';

import React from 'react';
import ApiPromise from '@polkadot/api/promise';
// import { isWeb3Injected, web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import defaults from '@polkadot/rpc-provider/defaults';
import { WsProvider } from '@polkadot/rpc-provider';
// import { InputNumber } from '@polkadot/react-components/InputNumber';
import keyring from '@polkadot/ui-keyring';
import uiSettings from '@polkadot/ui-settings';
import ApiSigner from '@polkadot/react-signer/ApiSigner';
import { Text, u32 as U32 } from '@polkadot/types';
import { formatBalance, isTestChain } from '@polkadot/util';

import ApiContext from '@polkadot/react-api/ApiContext';


let isWeb3Injected: boolean = false;
let web3Accounts: () => Promise<any>;
let web3Enable: (originalName: string) => Promise<any> = () => new Promise(() => {});
const isClient = typeof window !== 'undefined';

if (isClient) {
  isWeb3Injected = require('@polkadot/extension-dapp').isWeb3Injected;
  web3Accounts = require('@polkadot/extension-dapp').web3Accounts;
  web3Enable = require('@polkadot/extension-dapp').web3Enable;
}

let api: ApiPromise;

interface Props {
  children: React.ReactNode;
  queuePayload: QueueTxPayloadAdd;
  queueSetTxStatus: QueueTxMessageSetStatus;
  url?: string;
}

interface State extends ApiProps {
  chain?: string | null;
}

interface InjectedAccountExt {
  address: string;
  meta: {
    name: string;
    source: string;
  };
}

export { api };

const injectedPromise = isClient && web3Enable('polkadot-js/apps');

export default class Api extends React.PureComponent<Props, State> {
  public state: State = {} as unknown as State;

  public constructor (props: Props) {
    super(props);

    const { queuePayload, queueSetTxStatus, url } = props;
    const provider = new WsProvider(url);
    const signer = new ApiSigner(queuePayload, queueSetTxStatus);

    const setApi = (provider: ProviderInterface): void => {
      api = new ApiPromise({ provider, signer });

      this.setState({ api }, (): void => {
        this.subscribeEvents();
      });
    };
    const setApiUrl = (url: string = defaults.WS_URL): void =>
      setApi(new WsProvider(url));

    api = new ApiPromise({ provider, signer });

    const isWeb3Ext = isClient && isWeb3Injected;

    this.state = {
      api,
      isApiConnected: false,
      isApiReady: false,
      isSubstrateV2: true,
      isWaitingInjected: isWeb3Ext,
      setApiUrl
    } as unknown as State;
  }

  public componentDidMount (): void {
    this.subscribeEvents();

    injectedPromise && injectedPromise
      .then((): void => this.setState({ isWaitingInjected: false }))
      .catch(console.error);
  }

  private subscribeEvents (): void {
    const { api } = this.state;

    api.on('connected', (): void => {
      this.setState({ isApiConnected: true });
    });

    api.on('disconnected', (): void => {
      this.setState({ isApiConnected: false });
    });

    api.on('ready', async (): Promise<void> => {
      try {
        await this.loadOnReady(api);
      } catch (error) {
        console.error('Unable to load chain', error);
      }
    });
  }

  private async loadOnReady (api: ApiPromise): Promise<void> {
    const [properties, value, injectedAccounts] = await Promise.all([
      api.rpc.system.properties<ChainProperties>(),
      api.rpc.system.chain<Text>(),
      isClient ? [] : web3Accounts().then((accounts): InjectedAccountExt[] =>
        accounts.map((props: any): InjectedAccountExt => {
          const {address, meta } = props;
          return {
          address,
          meta: {
            ...meta,
            name: `${meta.name} (${meta.source === 'polkadot-js' ? 'extension' : meta.source})`
          }
        }})
      )
    ]);
    const addressPrefix = (
      uiSettings.prefix === -1
        ? properties.ss58Format.unwrapOr(new U32(42)).toNumber()
        : uiSettings.prefix
    ) as Prefix;
    const tokenSymbol = properties.tokenSymbol.unwrapOr('DEV').toString();
    const tokenDecimals = properties.tokenDecimals.unwrapOr(new U32(15)).toNumber();
    const chain = value
      ? value.toString()
      : null;
    const isDevelopment = isTestChain(chain);

    console.log('api: found chain', chain, JSON.stringify(properties));

    // first setup the UI helpers
    formatBalance.setDefaults({
      decimals: tokenDecimals,
      unit: tokenSymbol
    });
    // InputNumber.setUnit(tokenSymbol);

    // finally load the keyring
    keyring.loadAll({
      addressPrefix,
      genesisHash: api.genesisHash,
      isDevelopment,
      type: 'ed25519'
    }, injectedAccounts);

    const defaultSection = Object.keys(api.tx)[0];
    const defaultMethod = Object.keys(api.tx[defaultSection])[0];
    const apiDefaultTx = api.tx[defaultSection][defaultMethod];
    const apiDefaultTxSudo =
      (api.tx.system && api.tx.system.setCode) || // 2.x
      (api.tx.consensus && api.tx.consensus.setCode) || // 1.x
      apiDefaultTx; // other
    const isSubstrateV2 = !!Object.keys(api.consts).length;

    this.setState({
      apiDefaultTx,
      apiDefaultTxSudo,
      chain,
      isApiReady: true,
      isDevelopment,
      isSubstrateV2
    });
  }

  public render (): React.ReactNode {
    const { api, apiDefaultTx, apiDefaultTxSudo, chain, isApiConnected, isApiReady, isDevelopment, isSubstrateV2, isWaitingInjected, setApiUrl } = this.state;

    return (
      <ApiContext.Provider
        value={{
          api,
          apiDefaultTx,
          apiDefaultTxSudo,
          currentChain: chain || '<unknown>',
          isApiConnected,
          isApiReady: isApiReady && !!chain,
          isDevelopment,
          isSubstrateV2,
          isWaitingInjected,
          setApiUrl
        }}
      >
        {this.props.children}
      </ApiContext.Provider>
    );
  }
}