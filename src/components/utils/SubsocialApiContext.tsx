import React, { useReducer, createContext, useContext, useEffect, useState } from 'react';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { SubsocialIpfsApi } from '@subsocial/api/ipfs';
import { newSubsocialApi } from './SubsocialConnect';
import { ApiPromise } from '@polkadot/api';
import { newLogger } from '@subsocial/utils';
import { useSubstrate } from '../substrate';
// import { isDevMode } from './env';

const log = newLogger('SubsocialApiContext')

// TODO make apis optional
export type SubsocialApiState = {
  subsocial: SubsocialApi,
  substrate: SubsocialSubstrateApi,
  ipfs: SubsocialIpfsApi,
  isApiReady: boolean
}

type SubsocialApiAction = {
  type: 'init'
  api: ApiPromise
}

function reducer (_state: SubsocialApiState, action: SubsocialApiAction): SubsocialApiState {
  switch (action.type) {
    case 'init': {
      const subsocial = newSubsocialApi(action.api)
      const { substrate, ipfs } = subsocial
      log.info('Subsocial API is ready')
      return { subsocial, substrate, ipfs, isApiReady: true }
    }
    default: {
      throw new Error(`Unsupported type of action: ${action?.type}`)
    }
  }
}

function functionStub () {
  throw new Error('Function needs to be set in SubsocialApiProvider')
}

// TODO maybe this is wrong to use "{} as ..." - check it
const emptyState = {
  subsocial: {} as SubsocialApi,
  substrate: {} as SubsocialSubstrateApi,
  ipfs: {} as SubsocialIpfsApi,
  isApiReady: false
}

export type SubsocialApiContextProps = {
  state: SubsocialApiState
  dispatch: React.Dispatch<SubsocialApiAction>
}

const contextStub: SubsocialApiContextProps = {
  state: emptyState,
  dispatch: functionStub
}

export type SubsocialApiProps = {
  api: ApiPromise
}

const createSubsocialState = (api?: ApiPromise) => {
  if (!api) return emptyState;

  const subsocial = newSubsocialApi(api)
  const { substrate, ipfs } = subsocial

  return {
    subsocial,
    substrate,
    ipfs,
    isApiReady: true
  }
}

export const SubsocialApiContext = createContext<SubsocialApiContextProps>(contextStub)

export function SubsocialApiProvider (props: React.PropsWithChildren<{}>) {
  const { api } = useSubstrate()
  const [ state, dispatch ] = useReducer(reducer, createSubsocialState(api))
  const [ isApiReady, setIsApiReady ] = useState(false)

  useEffect(() => {
    if (!api || isApiReady) return

    const load = async () => {
      await api.isReady
      setIsApiReady(true)
      dispatch({ type: 'init', api: api as ApiPromise })
    }

    load()
  }, [ api, isApiReady ])

  const contextValue: SubsocialApiContextProps = {
    state,
    dispatch
  }

  // console.log('SubsocialApiProvider.api', api)

  return <SubsocialApiContext.Provider value={contextValue}>
    {/* {isDevMode &&
      <div className='p-1 pl-2 pr-2' style={{ backgroundColor: isApiReady ? '#cfffc5' : '' }}>
        Substrate API is {isApiReady ? <b>ready</b> : <em>connecting...</em>}
      </div>
    } */}
    {props.children}
  </SubsocialApiContext.Provider>
}

export function useSubsocialApi (): SubsocialApiState {
  return { ...useContext(SubsocialApiContext).state }
}

export function useSubstrateApi () {
  return useSubsocialApi().substrate
}

export function useIpfsApi () {
  return useSubsocialApi().ipfs
}

export default SubsocialApiProvider
