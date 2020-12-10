import React, { useCallback, useEffect, useReducer, useContext, useState } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import { DefinitionRpcExt, RegistryTypes } from '@polkadot/types/types'
import keyring, { Keyring } from '@polkadot/ui-keyring'
import { registryTypes as SubsocialTypes } from '@subsocial/types'
import { newLogger, isNum, isDef } from '@subsocial/utils'
import { appName, isDevMode, substrateUrl } from '../utils/env'
import { cacheSubstrateMetadata, getSubstrateMetadataRecord as getCachedSubstrateMetadata } from '../../storage/substrate'
import registry from '@subsocial/types/substrate/registry'
import { formatBalance } from '@polkadot/util'

const DEFAULT_DECIMALS = registry.createType('u32', 12)
const DEFAULT_SS58 = registry.createType('u32', 28)
const DEFAULT_TOKEN = registry.createType('Text', 'SMN')

const log = newLogger('SubstrateContext')

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

export type State = {
  endpoint?: string | string[]
  types?: RegistryTypes
  rpc: JsonRpc
  api?: ApiPromise
  apiError?: any
  apiState?: ApiState,
  connecting?: boolean,
  keyring?: Keyring
  keyringState?: KeyringState
  keyringError?: Error
}

const INIT_STATE: State = {
  endpoint: substrateUrl,
  types: SubsocialTypes,
  connecting: true,
  rpc: { ...jsonrpc }
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'RESET_SOCKET': {
      const endpoint = action.payload || state.endpoint
      return { ...state, endpoint, api: undefined, apiState: undefined }
    }
    case 'CONNECT': {
      log.info(`Connected to Substrate node ${state.endpoint?.toString()}`)
      return { ...state, api: action.payload, apiState: 'CONNECTING', connecting: true }
    }
    case 'CONNECT_SUCCESS': {
      if (state.apiState !== 'CONNECTING') {
        const { payload } = action
        let tookTimeLog: string | undefined
        if (isNum(payload)) {
          const startTime = payload
          const tookTime = window.performance.now() - startTime
          tookTimeLog = `Took ${tookTime / 1000} seconds`
        }
        log.info(`✅ Substrate API is ready. ${tookTimeLog}`)
      }
      return { ...state, apiState: 'READY', connecting: false }
    }
    case 'CONNECT_ERROR': {
      const err = action.payload
      log.error(`❌ Failed to connect to Substrate node ${state.endpoint?.toString()} . ${err}`)
      return { ...state, apiState: 'ERROR', apiError: err }
    }
    case 'SET_KEYRING': {
      log.info('✅ Loaded accounts with Keyring')
      return { ...state, keyring: action.payload, keyringState: 'READY' }
    }
    case 'KEYRING_ERROR': {
      const err = action.payload
      log.error(`❌ Failed to load accounts with Keyring. ${err}`)
      return { ...state, keyring: undefined, keyringState: 'ERROR', keyringError: err }
    }
    default: {
      throw new Error(`Unknown type of action: ${action.type}`)
    }
  }
}

export type Dispatch = (action: Action) => void

type ContextValue = [ State, Dispatch ]

export const SubstrateContext = React.createContext<ContextValue>(
  undefined as unknown as ContextValue)

type SubstrateProviderProps = React.PropsWithChildren<{
  endpoint?: string
  types?: RegistryTypes
}>

let _api: ApiPromise

export { _api as api }

export const SubstrateProvider = (props: SubstrateProviderProps) => {
  const initState: State = {
    ...INIT_STATE,
    endpoint: props.endpoint || INIT_STATE.endpoint,
    types: props.types || INIT_STATE.types
  }

  const [ state, dispatch ] = useReducer(reducer, initState)
  const [ ss58Format, setSs58Fromat ] = useState<number>(DEFAULT_SS58.toNumber())

  const { api, endpoint, rpc, types, apiState } = state
  // `useCallback` so that returning memoized function and not created
  //   everytime, and thus re-render.
  const connect = useCallback(async () => {
    if (api) return

    log.info(`Connecting to Substrate node ${endpoint} ...`)
    const connectTime = window.performance.now()

    const provider = new WsProvider(endpoint)

    const metadata = await getCachedSubstrateMetadata()
    let isMetadataCached = isDef(metadata)

    // console.log(`>>> METADATA key: ${Object.keys(metadata || {})}`)

    _api = new ApiPromise({ provider, types, rpc, metadata })

    const onConnectSuccess = async () => {
      dispatch({ type: 'CONNECT_SUCCESS', payload: connectTime })
      if (!isMetadataCached) {
        isMetadataCached = true
        await cacheSubstrateMetadata(_api)
      }
    }

    const onReady = () => {
      dispatch({ type: 'CONNECT', payload: _api })
      onConnectSuccess()
    }

    const onConnect = () => {
      dispatch({ type: 'CONNECT', payload: _api })
      // `ready` event is not emitted upon reconnection. So we check explicitly here.
      _api.isReady.then((_api) => onConnectSuccess())
    }

    _api.on('connected', onConnect)
    _api.on('ready', onReady)
    _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }))
    _api.on('disconnected', () => log.info(`Disconnected from Substrate node ${endpoint}`))

    return () => _api?.disconnect()
  }, [ api, endpoint, rpc, types, dispatch ])

  // hook to get injected accounts
  const { keyringState } = state
  const loadAccounts = useCallback(async (api: ApiPromise) => {
    // Ensure the method only run once.
    if (keyringState || !api) return

    try {
      await web3Enable(appName)
      let allAccounts = await web3Accounts()
      allAccounts = allAccounts.map(({ address, meta }) =>
        ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } }))

      keyring.loadAll({ isDevelopment: isDevMode, ss58Format }, allAccounts)
      dispatch({ type: 'SET_KEYRING', payload: keyring })
    } catch (err) {
      log.error(`Keyring failed to load accounts. ${err}`)
      dispatch({ type: 'KEYRING_ERROR', payload: err })
    }
  }, [ keyringState, dispatch ])

  useEffect(() => {
    connect()
  }, [ connect ])

  useEffect(() => {
    if (!api) return

    api.isReady
      .then(api => loadAccounts(api))
  }, [ loadAccounts, api ])

  useEffect(() => {
    if (apiState !== 'READY' || !api) return

    const setupTokensProps = async () => {
      const properties = await api.rpc.system.properties()

      registry.setChainProperties(properties)

      const tokenSymbol = properties.tokenSymbol.unwrapOr(DEFAULT_TOKEN).toString()
      const tokenDecimals = properties.tokenDecimals.unwrapOr(DEFAULT_DECIMALS).toNumber()
      formatBalance.setDefaults({
        decimals: tokenDecimals,
        unit: tokenSymbol
      })

      const ss58Format = properties.ss58Format.unwrapOr(undefined)
      ss58Format && setSs58Fromat(ss58Format.toNumber())
    }

    setupTokensProps()

  }, [ apiState ])

  return (
    <SubstrateContext.Provider value={[ state, dispatch ]}>
      {props.children}
    </SubstrateContext.Provider>
  )
}

export const useSubstrateContext = () => useContext(SubstrateContext)[0]
