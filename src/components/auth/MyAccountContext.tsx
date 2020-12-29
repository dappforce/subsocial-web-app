import { GenericAccountId, Option } from '@polkadot/types'
import { AccountInfo } from '@polkadot/types/interfaces'
import { AnyAccountId, SocialAccountWithId } from '@subsocial/types'
import { SocialAccount } from '@subsocial/types/substrate/interfaces'
import { newLogger, nonEmptyStr } from '@subsocial/utils'
import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { useDispatch } from 'react-redux'
import { useCreateReloadAccountIdsByFollower, useCreateReloadSpaceIdsByOwner } from 'src/rtk/app/hooks'
import { convertToDerivedContent, flattenProfileStruct, ProfileData } from 'src/types'
import store from 'store'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { reloadSpaceIdsFollowedByAccount } from '../spaces/helpers/reloadSpaceIdsFollowedByAccount'
import { equalAddresses } from '../substrate'
import { ONE } from '../utils'
import BN from 'bn.js'
import registry from '@subsocial/types/substrate/registry'

const log = newLogger('MyAccountContext')

function print (x?: any): string {
  return typeof x?.toString === 'function' ? x.toString() : ''
}

const MY_ADDRESS = 'df.myAddress'
const DID_SIGN_IN = 'df.didSignIn'

function storeDidSignIn () {
  store.set(DID_SIGN_IN, true)
}

export function readMyAddress (): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS)
  if (nonEmptyStr(myAddress)) {
    storeDidSignIn()
  }
  return myAddress
}

function storeMyAddress (myAddress: string) {
  store.set(MY_ADDRESS, myAddress)
  storeDidSignIn()
}

export const didSignIn = (): boolean => store.get(DID_SIGN_IN)

type MyAccountState = {
  inited: boolean
  address?: string
  account?: ProfileData // TODO rename to accountData or profile
  accountInfo?: AccountInfo
  clientNonce?: BN
}

type MyAccountAction = {
  type: 'reload' | 'setAddress' | 'setAccount' | 'setAccountInfo' | 'incClientNonce' | 'forget'
  address?: string
  account?: ProfileData // TODO rename to accountData or profile
  accountInfo?: AccountInfo
  clientNonce?: BN
}

function reducer (state: MyAccountState, action: MyAccountAction): MyAccountState {

  function forget () {
    log.info('Delete my address from the local storage')
    store.remove(MY_ADDRESS)
    return { ...state, address: undefined }
  }

  let address: string | undefined

  switch (action.type) {
    case 'reload':
      address = readMyAddress()
      log.info(`Reload my address from the local storage: ${print(address)}`)
      return { ...state, address, inited: true }

    case 'setAddress':
      address = action.address
      if (!equalAddresses(address, state.address)) {
        if (address) {
          log.info(`Set my new address: ${print(address)}`)
          storeMyAddress(address)
          return { ...state, address, inited: true }
        } else {
          return forget()
        }
      }
      return state

    case 'setAccount': {
      const { account } = action
      return { ...state, account }
    }

    case 'setAccountInfo': {
      const { accountInfo } = action
      const clientNonce = accountInfo?.nonce
      return { ...state, accountInfo, clientNonce }
    }

    case 'incClientNonce': {
      const currentNonce = state.clientNonce
      if (!currentNonce) return state

      const clientNonce = currentNonce.add(ONE)
      log.debug(
        'Chain nonce:',
        state.accountInfo?.nonce.toNumber() || 'n/a',
        '; New client nonce:',
        clientNonce?.toNumber() || 'n/a'
      )
      return { ...state, clientNonce }
    }

    case 'forget':
      return forget()

    default:
      throw new Error('No action type provided')
  }
}

function functionStub (): any {
  log.error(`Function needs to be set in ${MyAccountProvider.name}`)
}

const initialState = {
  inited: false,
  address: undefined
}

export type MyAccountContextProps = {
  state: MyAccountState
  dispatch: React.Dispatch<MyAccountAction>
  setAddress: (address: string) => void
  incClientNonce: () => void
  signOut: () => void
};

const contextStub: MyAccountContextProps = {
  state: initialState,
  dispatch: functionStub,
  setAddress: functionStub,
  incClientNonce: functionStub,
  signOut: functionStub,
}

type UnsubscribeFn = {
  (): void | undefined;
  (): void;
}

export const MyAccountContext = createContext<MyAccountContextProps>(contextStub)

export function MyAccountProvider (props: React.PropsWithChildren<{}>) {
  const [ state, dispatch ] = useReducer(reducer, initialState)
  const reduxDispatch = useDispatch()
  const reloadAccountIdsByFollower = useCreateReloadAccountIdsByFollower()
  const reloadSpaceIdsByOwner = useCreateReloadSpaceIdsByOwner()
  const { inited, address } = state

  useEffect(() => {
    if (!inited) {
      dispatch({ type: 'reload' })
    }
  }, [ inited ]) // Don't call this effect if `invited` is not changed

  useSubsocialEffect(({ substrate: { api }, subsocial: { ipfs } }) => {
    if (!inited || !address) return

    let unsubSocialAccount: UnsubscribeFn
    let unsubAccountInfo: UnsubscribeFn

    const loadAndSubscribe = async () => {
      const readyApi = await api

      unsubSocialAccount = await readyApi.query.profiles
        .socialAccountById(address, async (optSocialAccount: Option<SocialAccount>) => {
          let account: ProfileData | undefined
          const subtrateStruct = optSocialAccount.unwrapOr(undefined)
          if (subtrateStruct) {
            const id = new GenericAccountId(registry, address)
            const struct = flattenProfileStruct({ id, ...subtrateStruct } as SocialAccountWithId)
            const { contentId } = struct

            // TODO use redux to get profile content or do not store profile content in MyAccountContext
            const content = contentId ? await ipfs.findProfile(contentId) : undefined
            
            account = { id: address, struct, content: convertToDerivedContent(content) }
          }

          log.debug('Social account updated on chain:', account)
          dispatch({ type: 'setAccount', account })
        })
      
      unsubAccountInfo = await readyApi.query.system
        .account(address, async (accountInfo: AccountInfo) => {
          log.debug('Account info updated on chain:', accountInfo.toJSON())
          dispatch({ type: 'setAccountInfo', accountInfo })
        })
    }

    loadAndSubscribe()

    return () => {
      unsubSocialAccount && unsubSocialAccount()
      unsubAccountInfo && unsubAccountInfo()
    }
  }, [ inited, address ])

  useSubsocialEffect(({ substrate }) => {
    if (!inited || !address) return

    reloadSpaceIdsFollowedByAccount({ substrate, dispatch: reduxDispatch, account: address })
    reloadAccountIdsByFollower(address)
    reloadSpaceIdsByOwner(address)
  }, [ reduxDispatch, inited, address ])

  const contextValue: MyAccountContextProps = {
    state,
    dispatch,
    setAddress: (address: string) => dispatch({ type: 'setAddress', address }),
    incClientNonce: () => dispatch({ type: 'incClientNonce' }),
    signOut: () => dispatch({ type: 'forget' }),
  }

  return (
    <MyAccountContext.Provider value={contextValue}>
      {props.children}
    </MyAccountContext.Provider>
  )
}

export function useMyAccount () {
  return useContext(MyAccountContext)
}

export function useMyAddress () {
  return useMyAccount().state.address
}

export function useClientNonce () {
  return useMyAccount().state.clientNonce
}

export function isMyAddress (anotherAddress?: AnyAccountId) {
  return equalAddresses(useMyAddress(), anotherAddress)
}

export function useIsSignedIn () {
  return nonEmptyStr(useMyAddress())
}

export default MyAccountProvider
