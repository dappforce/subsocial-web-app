import React, { useReducer, createContext, useContext, useEffect } from 'react';
import { SubsocialApi } from '@subsocial/api/fullApi';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';
import { ipfsUrl, getApi, offchainUrl } from './SubsocialConnect';
import { ApiPromise } from '@polkadot/api';
import { useApi } from '@subsocial/react-hooks';
import { newLogger } from '@subsocial/utils';

const log = newLogger('SubsocialApiContext')

export type SubsocialApiState = {
  subsocial: SubsocialApi,
  substrate: SubsocialSubstrateApi,
  ipfs: SubsocialIpfsApi,
  isReady?: boolean
}

type SubsocialApiAction = {
  type: 'init' | 'set'
  api: ApiPromise
}

function reducer (state: SubsocialApiState, action: SubsocialApiAction): SubsocialApiState {

  switch (action.type) {
    case 'init':
      const subsocial = new SubsocialApi({ substrateApi: action.api, ipfsNodeUrl: ipfsUrl, offchainUrl })
      log.info('Subsocial API initialized')
      return { subsocial, substrate: subsocial.substrate, ipfs: subsocial.ipfs, isReady: true }

    default:
      throw new Error('No action type provided')
  }
}

function functionStub () {
  throw new Error('Function needs to be set in SubsocialApiProvider')
}

const initialState = {
  subsocial: {} as SubsocialApi,
  substrate: {} as SubsocialSubstrateApi,
  ipfs: {} as SubsocialIpfsApi,
  isReady: false
}

export type SubsocialApiContextProps = {
  state: SubsocialApiState
  dispatch: React.Dispatch<SubsocialApiAction>
  initial: (api: ApiPromise) => void
}

const contextStub: SubsocialApiContextProps = {
  state: initialState,
  dispatch: functionStub,
  initial: functionStub
}

export type SubsocialApiProps = {
  api: ApiPromise
}

const createSubsocialState = (api: ApiPromise) => {
  if (!api) return undefined;

  const subsocial = new SubsocialApi({ substrateApi: api, ipfsNodeUrl: ipfsUrl, offchainUrl });
  return {
    subsocial,
    substrate: subsocial.substrate,
    ipfs: subsocial.ipfs,
    isReady: true
  }
}

export const SubsocialApiContext = createContext<SubsocialApiContextProps>(contextStub)

export function SubsocialApiProvider (props: React.PropsWithChildren<{}>) {
  const { api } = useApi()
  const [ state, dispatch ] = useReducer(reducer, createSubsocialState(api) || initialState)
  useEffect(() => {
    if (!state.isReady) {
      getApi().then(api => dispatch({ type: 'init', api: api }))
    }
  }, [ state.isReady ])

  const contextValue = {
    state,
    dispatch,
    initial: (api: ApiPromise) => dispatch({ type: 'init', api: api })
  }
  return <SubsocialApiContext.Provider value={contextValue}>{props.children}</SubsocialApiContext.Provider>
}

export function useSubsocialApi () {
  return { ...useContext(SubsocialApiContext).state }
}

export function useSubstrateApi () {
  return useSubsocialApi().substrate
}

export function useIpfsApi () {
  return useSubsocialApi().ipfs
}

export default SubsocialApiProvider
