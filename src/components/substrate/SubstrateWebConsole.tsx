import { newLogger } from '@subsocial/utils'
import { useSubstrate } from './useSubstrate'

const log = newLogger(SubstrateWebConsole.name)

/** This component will simply add Substrate utility functions to your web developer console. */
export default function SubstrateWebConsole () {
  if (!window) return null

  const { api, apiState, keyring, keyringState } = useSubstrate()
  const substrate: any = {}
  if (apiState === 'READY') {
    substrate.api = api
  }
  if (keyringState === 'READY') {
    substrate.keyring = keyring
  }
  substrate.util = require('@polkadot/util')
  substrate.crypto = require('@polkadot/util-crypto');
  (window as any).substrate = substrate
  log.info('Exported Substrate helpers. Check out window.substrate')

  return null
}
