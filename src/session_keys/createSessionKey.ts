import { readMyAddress } from '../components/auth/MyAccountContext'
import store from 'store'
import { clearNotifications, insertToSessionKeyTable, getNonce, getSessionKey } from '../components/utils/OffchainUtils';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp'
import { appName } from '../components/utils/env'
import { stringToHex, u8aToHex, hexToU8a } from '@polkadot/util'
import { naclSign } from '@polkadot/util-crypto'
import { GenericAccountId } from '@polkadot/types'
import registry from '@subsocial/types/substrate/registry'
import { mnemonicGenerate, mnemonicToMiniSecret, naclKeypairFromSeed } from '@polkadot/util-crypto'
import { Keypair } from '@polkadot/util-crypto/types'
import jsonabc from 'jsonabc'

const SESSION_KEY = 'df.sessionKeys'

type Action = 'readAll' | 'addSessionKey'

type SessionKeypair = {
  publicKey: string,
  secretKey: string
}

export type AddSessionKeyArgs = {
  sessionKey: string
}

export type ReadAllMessage = {
  blockNumber: string,
  eventIndex: number
}

type MessageGenericExtends = AddSessionKeyArgs | ReadAllMessage

type Message<T extends MessageGenericExtends> = {
  nonce: number,
  action: Action,
  args: T
}

export type SessionCall<T extends MessageGenericExtends> = {
  account: string,
  signature: string,
  message: Message<T>
}

type SessionKeyStorege = Record<string, SessionKeypair>

const JSONstingifySorted = (obj: Object) => JSON.stringify(jsonabc.sortObj(obj))

const newGenericAccount = (account: string | undefined) => account ? String(new GenericAccountId(registry, hexToU8a(account))): ''

export const createSessionKey = async (): Promise<SessionKeypair | undefined> => {
  const address = readMyAddress()
  // const address = new GenericAccountId(registry, myAddress)
  if (!address) return

  const extensions = await web3Enable(appName)
  if (!extensions.length) {
    return
  }
  const allAccounts = await web3Accounts()

  const account = allAccounts.find(x => new GenericAccountId(registry, x.address))
  if (!account) return
  const { publicKey, secretKey } = generateKeyPair()

  const publicKeyHex = u8aToHex(publicKey)
  const secretKeyHex = u8aToHex(secretKey)

  const selectedNonce = await getNonce(address)
  let nonce = 0
  if (selectedNonce)
    nonce = parseInt(selectedNonce)

  const message: Message<AddSessionKeyArgs> = {
    nonce,
    action: 'addSessionKey',
    args: {
      sessionKey: publicKeyHex
    }
  }

  const signature = await signMessage(account.meta.source, address, JSONstingifySorted(message))
  if (!signature) return
  const sessionKey: SessionKeypair = {
    publicKey: publicKeyHex,
    secretKey: secretKeyHex
  }

  const storage: SessionKeyStorege = store.get(SESSION_KEY) || {}

  storage[address] = sessionKey

  store.set(SESSION_KEY, storage)
  await insertToSessionKeyTable({
    account: address,
    signature,
    message
  } as SessionCall<AddSessionKeyArgs>)

  return sessionKey
}

export const generateKeyPair = (): Keypair => {
  const mnemonic = mnemonicGenerate()
  const seed = mnemonicToMiniSecret(mnemonic)
  const keypair = naclKeypairFromSeed(seed)

  return keypair
}

const signMessage = async (source: string, address: string, message: string): Promise<string | undefined> => {
  const injector = await web3FromSource(source)

  const signRaw = injector?.signer?.signRaw

  if (!!signRaw) {
    const { signature } = await signRaw({
      address,
      data: stringToHex(message),
      type: 'bytes'
    })
    return signature
  }
  return undefined
}

export const readAllNotifications = async (blockNumber: string, eventIndex: number, address: string) => {
  const sessionKeyStorage: SessionKeyStorege = store.get(SESSION_KEY)
  let sessionKey: SessionKeypair | undefined = undefined

  for (const key in sessionKeyStorage) {
    if (key == address) {
      sessionKey = sessionKeyStorage[key]
      break
    }
  }

  const isSessionKey = await getSessionKey(newGenericAccount(sessionKey?.publicKey))

  if (!sessionKey || !isSessionKey) {
    sessionKey = await createSessionKey()
    if (!sessionKey) return
  }

  const keypair = {
    publicKey: hexToU8a(sessionKey.publicKey),
    secretKey: hexToU8a(sessionKey.secretKey)
  } as Keypair

  const genericAccount = new GenericAccountId(registry, u8aToHex(keypair.publicKey))

  const selectedNonce = await getNonce(String(genericAccount))
  let nonce = 0
  if (selectedNonce)
    nonce = parseInt(selectedNonce)

  const message: Message<ReadAllMessage> = {
    nonce,
    action: 'readAll',
    args: {
      blockNumber,
      eventIndex
    }
  }

  const signature = naclSign(JSONstingifySorted(message), keypair)
  if (!signature) return

  clearNotifications({
    account: String(genericAccount),
    signature: u8aToHex(signature),
    message
  } as SessionCall<ReadAllMessage>)
}