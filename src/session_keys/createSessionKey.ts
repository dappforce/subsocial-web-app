import { readMyAddress } from '../components/auth/MyAccountContext';
import store from 'store'
import { clearNotifications, insertToSessionKeyTable } from '../components/utils/OffchainUtils';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { appName } from '../components/utils/env';
import { stringToHex, u8aToHex, hexToU8a } from '@polkadot/util';
import { naclSign } from '@polkadot/util-crypto';
import { GenericAccountId } from '@polkadot/types';
import registry from '@subsocial/types/substrate/registry'
import { mnemonicGenerate, mnemonicToMiniSecret, naclKeypairFromSeed } from '@polkadot/util-crypto'
import { Keypair } from '@polkadot/util-crypto/types'

type SessionKeypair = {
  publicKey: string,
  secretKey: string,
  source: string
}

export type SessionKeyMessage = {
  mainKey: string,
  sessionKey: string
}

export type ReadAllMessage = {
  sessionKey: string,
  blockNumber: string,
  eventIndex: number
}

const generateStoreKey = (address: string) => `${address}_sessionKey`

export const createSessionKey = async (): Promise<SessionKeypair | undefined> => {
  const myAddress = readMyAddress()
  const address = new GenericAccountId(registry, myAddress)
  if (!address) return

  const extensions = await web3Enable(appName);
  if (!extensions.length) {
    return
  }
  const allAccounts = await web3Accounts();

  const account = allAccounts.find(x => new GenericAccountId(registry, x.address))
  if (!account) return

  const {publicKey, secretKey} = generateKeyPair()

  const publicKeyHex = u8aToHex(publicKey)
  const secretKeyHex = u8aToHex(secretKey)

  const message: SessionKeyMessage = {
    mainKey: address.toString(),
    sessionKey: publicKey.toString()
  }

  const signature = await signMessage(account.meta.source, address.toString(), JSON.stringify(message))
  if (!signature) return

  let sessionKey: SessionKeypair = {
    publicKey: publicKeyHex,
    secretKey: secretKeyHex,
    source: account.meta.source
  }
  const key = generateStoreKey(address.toString())

  store.set(key, sessionKey)
  insertToSessionKeyTable(message, signature)

  return sessionKey
}

export const generateKeyPair = (): Keypair => {
  const mnemonic = mnemonicGenerate();
  const seed = mnemonicToMiniSecret(mnemonic);
  const keypair = naclKeypairFromSeed(seed);

  return keypair
}

const signMessage = async (source: string, address: string, message: string): Promise<string | undefined> => {

  const injector = await web3FromSource(source);

  const signRaw = injector?.signer?.signRaw;

  if (!!signRaw) {
    const { signature } = await signRaw({
      address,
      data: stringToHex(message),
      type: 'bytes'
    });
    return signature
  }
  return undefined
}

export const readAllNotifications = async (blockNumber: string, eventIndex: number, address: string) => {
  let sessionKey: SessionKeypair | undefined = store.get(generateStoreKey(address))
  if (!sessionKey) {
    sessionKey = await createSessionKey()
    if (!sessionKey) return
  }

  const message: ReadAllMessage = {
    sessionKey: sessionKey.publicKey,
    blockNumber: blockNumber.toString(),
    eventIndex: eventIndex
  }

  const keypair = {
    publicKey: hexToU8a(sessionKey.publicKey),
    secretKey: hexToU8a(sessionKey.secretKey)
  } as Keypair

  const signature = naclSign(stringToHex(JSON.stringify(message)), keypair)
  if (!signature) return

  await clearNotifications(address, u8aToHex(signature), message)
}