import BN from 'bn.js'
import { } from '@subsocial/api/utils/types'
import dayjs from 'dayjs'

function getEnv (varName: string): string | undefined {
  const { env } = typeof window === 'undefined' ? process : window.process
  return env[varName]
}

function getEnvAsBool (varName: string): boolean {
  return getEnv(varName)?.toString()?.toLowerCase() === 'true'
}

function getEnvAsArray (varName: string): string[] {
  return getEnv(varName)?.split(',') || []
}

function getEnvAsNumber (varName: string) {
  const value = getEnv(varName)
  return value ? parseInt(value) : undefined
}

function getEnvAsDate (varName: string) {
  const dateStr = getEnv(varName)
  try {
    return dateStr ? dayjs(dateStr) : undefined
  } catch (err) {
    return undefined
  }
}

export const nodeEnv = getEnv('NODE_ENV')

export const isProdMode = nodeEnv === 'production'
export const isDevMode = !isProdMode

export const appName = getEnv('APP_NAME') || 'Subsocial'

export const offchainUrl = getEnv('OFFCHAIN_URL') || 'http://localhost:3001'
export const offchainWs = getEnv('OFFCHAIN_WS') || 'http://localhost:3011'
export const ipfsNodeUrl = getEnv('IPFS_URL') || 'http://localhost:8080'
export const substrateUrl = getEnv('SUBSTRATE_URL') || 'ws://127.0.0.1:9944'
export const kusamaUrl = 'wss://kusama-rpc.polkadot.io'

// UI settings
export const uiShowAdvanced = getEnvAsBool('UI_SHOW_ADVANCED')
export const uiShowSearch = getEnvAsBool('UI_SHOW_SEARCH')
export const uiShowFeed = getEnvAsBool('UI_SHOW_FEED')
export const uiShowNotifications = getEnvAsBool('UI_SHOW_NOTIFICATIONS')
export const uiShowActivity = getEnvAsBool('UI_SHOW_ACTIVITY')

export const dagHttpMethod = getEnv('DAG_HTTP_METHOD')?.toLowerCase() || 'post'

export const advancedUrl = `https://polkadot.js.org/apps/?rpc=${substrateUrl}`
export const landingPageUrl = 'https://subsocial.network'

export const appBaseUrl = getEnv('APP_BASE_URL') || ''

export const seoOverwriteLastUpdate = getEnvAsDate('SEO_OVERWRITE_LAST_UPDATE')

export const lastReservedSpaceId = getEnvAsNumber('LAST_RESERVED_SPACE_ID') || 0
export const claimedSpaceIds = getEnvAsArray('CLAIMED_SPACE_IDS').map(x => new BN(x))
