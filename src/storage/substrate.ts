import { newStore } from './store'
import { newLogger, isEmptyStr } from '@subsocial/utils'
import { ApiPromise } from '@polkadot/api'

const storeName = 'substrate'
const keyMetadata = 'metadata'
const store = newStore(storeName)

const log = newLogger(`LocalForage.${storeName}`)

type Metadata = {
  key: string
  value: string
}

type MetadataRecord = Record<string, string>

export async function cacheSubstrateMetadata (api?: ApiPromise): Promise<void> {
  if (!api) {
    log.error('Substrate API is undefined')
    return
  }
  if (!api.isReady) {
    log.error('Substrate API is not ready')
    return
  }

  const genesisHash = api.genesisHash
  const { specVersion } = api.runtimeVersion
  const key = `${genesisHash}-${specVersion}`
  const value = api.runtimeMetadata.toHex()
  await setSubstrateMetadata({ key, value })
  log.info(`Substrate metadata cached locally. Metadata key: ${key}`)
}

/**
 * Metadata `key` consists of `${genesisHash}-${runtimeVersion.specVersion}`.
 * Metadata `value` is a hex representation of metadata.
 */
async function setSubstrateMetadata (metadata: Metadata): Promise<void> {
  try {
    await store.setItem(keyMetadata, metadata)
  } catch (err) {
    log.error(`Failed to save Substrate metadata. ${err}`)
  }
}

export async function getSubstrateMetadataRecord (): Promise<MetadataRecord | undefined> {
  const cachedMetadata = await getSubstrateMetadata()
  if (!cachedMetadata) return undefined

  return { [cachedMetadata.key]: cachedMetadata.value }
}

export async function getSubstrateMetadata (): Promise<Metadata | undefined> {
  try {
    const metadata = await store.getItem(keyMetadata) as Metadata

    if (!metadata) throw new Error('Metadata is empty')
    if (isEmptyStr(metadata.key)) throw new Error('Metadata key is empty')
    if (isEmptyStr(metadata.value)) throw new Error('Metadata value is empty')

    log.info(`Substrate metadata found in the local cache. Metadata key: ${metadata.key}`)
    return metadata
  } catch (err) {
    log.warn(`Failed to get Substrate metadata. ${err}`)
    return undefined
  }
}
