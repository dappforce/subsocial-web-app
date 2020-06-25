import { useEffect } from 'react'
import { newLogger } from '@subsocial/utils'
import { useSubstrate } from './useSubstrate'
import { ApiPromise } from '@polkadot/api'
import { Keyring } from '@polkadot/ui-keyring'

const log = newLogger(SubstrateWebConsole.name)

type WindowSubstrate = {
  api?: ApiPromise
  keyring?: Keyring
  util?: any
  crypto?: any
}

const getWindowSubstrate = (): WindowSubstrate => {
  let substrate = (window as any)?.substrate
  if (!substrate) {
    substrate = {} as WindowSubstrate
    (window as any).substrate = substrate
  }
  return substrate
}

/** This component will simply add Substrate utility functions to your web developer console. */
export default function SubstrateWebConsole () {
  const { endpoint, api, apiState, keyring, keyringState } = useSubstrate()

  const addApi = () => {
    if (window && apiState === 'READY') {
      getWindowSubstrate().api = api
      log.info('Exported window.substrate.api')
    }
  }

  const addKeyring = () => {
    if (window && keyringState === 'READY') {
      getWindowSubstrate().keyring = keyring
      log.info('Exported window.substrate.keyring')
    }
  }

  const addUtilAndCrypto = () => {
    if (window) {
      const substrate = getWindowSubstrate()

      substrate.util = require('@polkadot/util')
      log.info('Exported window.substrate.util')

      substrate.crypto = require('@polkadot/util-crypto');
      log.info('Exported window.substrate.crypto')
    }
  }

  useEffect(() => {
    addApi()
  }, [ endpoint?.toString(), apiState ])

  useEffect(() => {
    addKeyring()
  }, [ keyringState ])

  useEffect(() => {
    addUtilAndCrypto()
  }, [ true ])

  return null
}
