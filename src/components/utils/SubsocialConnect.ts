import axios from 'axios';

import { api as polkadotApi } from '@polkadot/react-api';
import { Api } from '@subsocial/api/substrateConnect'
import { getEnv } from './utils';
import { ApiPromise } from '@polkadot/api';
import { Activity } from '@subsocial/types/offchain';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';

export const offchainUrl = getEnv('OFFCHAIN_URL') || 'http://localhost:3001';
export const ipfsUrl = getEnv('IPFS_URL') || '/ip4/127.0.0.1/tcp/5002/http';
export const substrateUrl = getEnv('SUBSTRATE_URL') || 'ws://127.0.0.1:9944';

export const ipfs = new SubsocialIpfsApi(ipfsUrl)

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(`${offchainUrl}/offchain/feed/${myAddress}?offset=${offset}&limit=${limit}`);
  const { data } = res;
  return data;
};

export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> => {
  const res = await axios.get(`${offchainUrl}/offchain/notifications/${myAddress}?offset=${offset}&limit=${limit}`);
  const { data } = res;
  return data;
};

export let api: ApiPromise;

export const getApi = async () => {
  if (polkadotApi) {
    console.log('Get Substrate API: @polkadot api');
    return polkadotApi.isReady;
  } else if (api) {
    console.log('Get Substrate API: SSR api');
    return api;
  } else {
    console.log('Get Substrate API: DfApi.setup()');
    api = await Api.connect(substrateUrl);
    return api;
  }
}
