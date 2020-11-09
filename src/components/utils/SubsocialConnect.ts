import { api as apiFromContext } from '../substrate';
import { Api as SubstrateApi } from '@subsocial/api/substrateConnect'
import { offchainUrl, substrateUrl, ipfsNodeUrl, dagHttpType } from './env';
import { ApiPromise } from '@polkadot/api';
import { newLogger } from '@subsocial/utils';
import { SubsocialApi } from '@subsocial/api/subsocial';

const log = newLogger('SubsocialConnect')

let subsocial!: SubsocialApi;
let isLoadingSubsocial = false

export const newSubsocialApi = (substrateApi: ApiPromise) => {
  return new SubsocialApi({ substrateApi, ipfsNodeUrl, offchainUrl, useServer: {
    httpRequestType: dagHttpType as any
  }})
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
