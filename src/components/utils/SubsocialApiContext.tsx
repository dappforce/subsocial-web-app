import React, { useReducer, createContext, useContext, useEffect, useState } from 'react'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
import { newSubsocialApi } from './SubsocialConnect'
import { ApiPromise } from '@polkadot/api'
import { newLogger } from '@subsocial/utils'
import { FlatSubsocialApi, newFlatApi, useSubstrate } from '../substrate'
import { controlledMessage } from './Message'
// import { isDevMode } from './env';

const log = newLogger('SubsocialApiContext')

export type SubsocialApiState = {
  flatApi: FlatSubsocialApi
  subsocial: SubsocialApi
  substrate: SubsocialSubstrateApi
  ipfs: SubsocialIpfsApi
  isApiReady: boolean
}

const emptyState: SubsocialApiState = {
  flatApi: {} as FlatSubsocialApi,
  subsocial: {} as SubsocialApi,
  substrate: {} as SubsocialSubstrateApi,
  ipfs: {} as SubsocialIpfsApi,
  isApiReady: false
}

type SubsocialApiAction = {
  type: 'init'
  api: ApiPromise
}

function reducer (_state: SubsocialApiState, action: SubsocialApiAction): SubsocialApiState {
  switch (action.type) {
    case 'init': {
      const initialState = createSubsocialState(action.api)
      log.info('Subsocial API is ready')

      if (window) {
        (window as any).subsocial = initialState.subsocial
      }

      return initialState
    }
    default: {
      throw new Error(`Unsupported type of action: ${action?.type}`)
    }
  }
}

function functionStub () {
  throw new Error('Function needs to be set in SubsocialApiProvider')
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

const createSubsocialState = (api?: ApiPromise): SubsocialApiState => {
  if (!api) return emptyState

  const subsocial = newSubsocialApi(api)
  const flatApi = newFlatApi(subsocial)
  const { substrate, ipfs } = subsocial

  return {
    flatApi,
    subsocial,
    substrate,
    ipfs,
    isApiReady: true
  }
}

export const SubsocialApiContext = createContext<SubsocialApiContextProps>(contextStub)

const message = controlledMessage({
  message: 'Connecting to the network...',
  type: 'info',
  duration: 0
})

export function SubsocialApiProvider (props: React.PropsWithChildren<{}>) {
  const { api } = useSubstrate()
  const [ state, dispatch ] = useReducer(reducer, createSubsocialState(api))
  const [ isApiReady, setIsApiReady ] = useState(false)

  useEffect(() => {
    if (!api || isApiReady) return message.open()

    const load = async () => {
      await api.isReady
      setIsApiReady(true)
      message.close()
      dispatch({ type: 'init', api })
    }

    load()
  }, [ api, isApiReady ])

  const contextValue: SubsocialApiContextProps = {
    state,
    dispatch
  }

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

export default SubsocialApiProvider
