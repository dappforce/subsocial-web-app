import { useContext, useEffect, useCallback } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import keyring from '@polkadot/ui-keyring'
import { newLogger } from '@subsocial/utils'

import { SubstrateContext } from './SubstrateContext'
import { appName, isDevMode } from '../utils/env'

const log = newLogger('useSubstrate')

// TODO move most of the code from this component to SubstrateProvider
export const useSubstrate = () => {
  const [ state, dispatch ] = useContext(SubstrateContext)
  const { api, endpoint, rpc, types } = state

  // `useCallback` so that returning memoized function and not created
  //   everytime, and thus re-render.
  const connect = useCallback(async () => {
    if (api) return

    const provider = new WsProvider(endpoint)
    const _api = new ApiPromise({ provider, types, rpc })
    log.info(`Connecting to Substrate node at ${endpoint} ...`)

    // We want to listen to event for disconnection and reconnection.
    //  That's why we set for listeners.
    _api.on('connected', () => {
      dispatch({ type: 'CONNECT', payload: _api })
      // `ready` event is not emitted upon reconnection. So we check explicitly here.
      _api.isReady.then((_api) => dispatch({ type: 'CONNECT_SUCCESS' }))
    })
    _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }))
    _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }))
  }, [ api, endpoint, rpc, types, dispatch ])

  // hook to get injected accounts
  const { keyringState } = state
  const loadAccounts = useCallback(async () => {
    // Ensure the method only run once.
    if (keyringState) return

    try {
      await web3Enable(appName)
      let allAccounts = await web3Accounts()
      allAccounts = allAccounts.map(({ address, meta }) =>
        ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } }))

      keyring.loadAll({ isDevelopment: isDevMode }, allAccounts)
      dispatch({ type: 'SET_KEYRING', payload: keyring })
    } catch (e) {
      console.error(e)
      dispatch({ type: 'KEYRING_ERROR' })
    }
  }, [ keyringState, dispatch ])

  useEffect(() => {
    connect()
  }, [ connect ])

  useEffect(() => {
    loadAccounts()
  }, [ loadAccounts ])

  return { ...state, dispatch }
}

export default useSubstrate
