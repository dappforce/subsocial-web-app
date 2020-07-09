import axios from 'axios';

import { api as apiFromContext } from '../substrate';
import { Api as SubstrateApi } from '@subsocial/api/substrateConnect'
import { offchainUrl, substrateUrl, ipfsNodeUrl } from './env';
import { ApiPromise } from '@polkadot/api';
import { Activity } from '@subsocial/types/offchain';
import { newLogger } from '@subsocial/utils';
import { SubsocialApi } from '@subsocial/api/subsocial';

const log = newLogger('SubsocialConnect')

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

let subsocial!: SubsocialApi;
let isLoadingSubsocial = false

export const newSubsocialApi = (substrateApi: ApiPromise) => {
  return new SubsocialApi({ substrateApi, ipfsNodeUrl, offchainUrl })
}

export const getSubsocialApi = async () => {
  if (!subsocial && !isLoadingSubsocial) {
    isLoadingSubsocial = true
    const api = await getSubstrateApi()
    subsocial = newSubsocialApi(api)
    isLoadingSubsocial = false
  }
  return subsocial
}

let api: ApiPromise;
let isLoadingSubstrate = false

const getSubstrateApi = async () => {
  if (apiFromContext) {
    log.debug('Get Substrate API from context')
    return apiFromContext.isReady
  }

  if (!api && !isLoadingSubstrate) {
    isLoadingSubstrate = true
    log.debug('Get Substrate API as Api.connect()')
    api = await SubstrateApi.connect(substrateUrl)
    isLoadingSubstrate = false
  }

  return api
}
