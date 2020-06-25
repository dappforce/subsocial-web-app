import React, { useReducer } from 'react'

import { Keyring } from '@polkadot/ui-keyring'
import { RegistryTypes, DefinitionRpcExt } from '@polkadot/types/types'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import { ApiPromise } from '@polkadot/api'

import { registryTypes as SubsocialTypes } from '@subsocial/types'
import { substrateUrl } from '../utils/env'
// import { newLogger } from '@subsocial/utils'

// const log = newLogger('SubstrateContext')

type ActionType =
  'RESET_SOCKET' |
  'CONNECT' |
  'CONNECT_SUCCESS' |
  'CONNECT_ERROR' |
  'SET_KEYRING' |
  'KEYRING_ERROR'

type Action = {
  type: ActionType
  payload?: any
}

type ApiState = 'CONNECTING' | 'READY' | 'ERROR'

type KeyringState = 'READY' | 'ERROR'

type JsonRpc = Record<string, Record<string, DefinitionRpcExt>>

type State = {
  endpoint?: string | string[]
  types?: RegistryTypes
  rpc: JsonRpc
  api?: ApiPromise
  apiError?: any
  apiState?: ApiState
  keyring?: Keyring
  keyringState?: KeyringState
}

const INIT_STATE: State = {
  endpoint: substrateUrl,
  types: SubsocialTypes,
  rpc: { ...jsonrpc }
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'RESET_SOCKET':
      const endpoint = action.payload || state.endpoint
      return { ...state, endpoint, api: undefined, apiState: undefined }

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' }

    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' }

    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload }

    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' }

    case 'KEYRING_ERROR':
      return { ...state, keyring: undefined, keyringState: 'ERROR' }

    default:
      throw new Error(`Unknown type: ${action.type}`)
  }
}

type Dispatch = (action: Action) => void

type ContextValue = [ State, Dispatch ]

export const SubstrateContext = React.createContext<ContextValue>(
  undefined as unknown as ContextValue)

type SubstrateProviderProps = React.PropsWithChildren<{
  endpoint?: string
  types?: RegistryTypes
}>

export const SubstrateProvider = (props: SubstrateProviderProps) => {
  const initState: State = {
    ...INIT_STATE,
    endpoint: props.endpoint || INIT_STATE.endpoint,
    types: props.types || INIT_STATE.types
  }

  const [ state, dispatch ] = useReducer(reducer, initState)

  return (
    <SubstrateContext.Provider value={[ state, dispatch ]}>
      {props.children}
    </SubstrateContext.Provider>
  )
}
