function getEnv (varName: string): string | undefined {
  const { env } = typeof window === 'undefined' ? process : window.process;
  return env[varName]
}

export const offchainUrl = getEnv('OFFCHAIN_URL') || 'http://localhost:3001'
export const offchainWs = getEnv('OFFCHAIN_WS') || 'http://localhost:3011'
export const ipfsNodeUrl = getEnv('IPFS_URL') || 'http://localhost:8080'
export const substrateUrl = getEnv('SUBSTRATE_URL') || 'ws://127.0.0.1:9944'
export const ElasticNodeURL = getEnv('ELASTIC_URL') || 'http://localhost:9200'
export const isDevelop = getEnv('IS_DEVELOP') === 'true'
