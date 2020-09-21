import BN from 'bn.js'

function getEnv (varName: string): string | undefined {
  const { env } = typeof window === 'undefined' ? process : window.process;
  return env[varName]
}

function getEnvAsBool (varName: string): boolean {
  return getEnv(varName)?.toString()?.toLowerCase() === 'true'
}

function getEnvAsArray (varName: string): any[] {
  return getEnv(varName)?.split(',') || []
}

export const nodeEnv = getEnv('NODE_ENV')
export const appName = getEnv('APP_NAME') || 'Subsocial'
export const offchainUrl = getEnv('OFFCHAIN_URL') || 'http://localhost:3001'
export const offchainWs = getEnv('OFFCHAIN_WS') || 'http://localhost:3011'
export const ipfsNodeUrl = getEnv('IPFS_URL') || 'http://localhost:8080'
export const substrateUrl = getEnv('SUBSTRATE_URL') || 'ws://127.0.0.1:9944'
export const elasticNodeURL = getEnv('ELASTIC_URL') || 'http://localhost:9200'
export const uiShowAdvanced = getEnvAsBool('UI_SHOW_ADVANCED')
export const claimedSpaceIds = getEnvAsArray('CLAIMED_SPACE_IDS').map(x => new BN(x))

export const kusamaUrl = 'wss://kusama-rpc.polkadot.io'

export const isProdMode = nodeEnv === 'production'
export const isDevMode = !isProdMode
