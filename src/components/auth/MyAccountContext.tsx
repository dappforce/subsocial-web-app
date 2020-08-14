import React, { useReducer, createContext, useContext, useEffect } from 'react';
import store from 'store';
import { newLogger, nonEmptyStr } from '@subsocial/utils';
import { AccountId } from '@polkadot/types/interfaces';
import { equalAddresses } from '../substrate';
import { ProfileData } from '@subsocial/types';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { SocialAccount } from '@subsocial/types/substrate/interfaces';
import { Option } from '@polkadot/types'

const log = newLogger('MyAccountContext')

function print (x?: any): string {
  return typeof x?.toString === 'function' ? x.toString() : ''
}

const MY_ADDRESS = 'df.myAddress';

export function readMyAddress (): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS);
  log.info(`Read my address from the local storage: ${print(myAddress)}`);
  return myAddress;
}

type MyAccountState = {
  inited: boolean,
  address?: string,
  account?: ProfileData
};

type MyAccountAction = {
  type: 'reload' | 'setAddress' | 'forget' | 'forgetExact' | 'setAccount',
  address?: string,
  account?: ProfileData
};

function reducer (state: MyAccountState, action: MyAccountAction): MyAccountState {
  function forget () {
    log.info('Forget my address and injected accounts');
    store.remove(MY_ADDRESS);
    return { ...state, address: undefined };
  }

  let address: string | undefined;

  switch (action.type) {
    case 'reload':
      address = readMyAddress();
      log.info(`Reload my address: ${print(address)}`);
      return { ...state, address, inited: true };

    case 'setAddress':
      address = action.address;
      if (address !== state.address) {
        if (address) {
          log.info(`Set my new address: ${print(address)}`);
          store.set(MY_ADDRESS, address);
          return { ...state, address, inited: true };
        } else {
          return forget();
        }
      }
      return state;

    case 'setAccount': {
      const account = action.account

      if (account) {
        return { ...state, account }
      }

      return state
    }

    case 'forget':
      return forget();

    default:
      throw new Error('No action type provided');
  }
}

function functionStub () {
  log.error(`Function needs to be set in ${MyAccountProvider.name}`);
}

const initialState = {
  inited: false,
  address: undefined
};

export type MyAccountContextProps = {
  state: MyAccountState,
  dispatch: React.Dispatch<MyAccountAction>,
  setAddress: (address: string) => void,
  signOut: () => void
};

const contextStub: MyAccountContextProps = {
  state: initialState,
  dispatch: functionStub,
  setAddress: functionStub,
  signOut: functionStub
};

export const MyAccountContext = createContext<MyAccountContextProps>(contextStub);

export function MyAccountProvider (props: React.PropsWithChildren<{}>) {
  const [ state, dispatch ] = useReducer(reducer, initialState);

  const { inited, address } = state

  useEffect(() => {
    if (!inited) {
      dispatch({ type: 'reload' });
    }
  }, [ inited ]); // Don't call this effect if `invited` is not changed

  useSubsocialEffect(({ substrate: { api }, subsocial: { ipfs } }) => {
    if (!inited || !address) return

    let unsub: { (): void | undefined; (): void; };

    const sub = async () => {
      const readyApi = await api

      unsub = await readyApi.query.profiles.socialAccountById(address, async (optSocialAccount: Option<SocialAccount>) => {
        const struct = optSocialAccount.unwrapOr(undefined)

        if (struct) {
          const profile = struct.profile.unwrapOr(undefined)

          const cid = profile && profile.content.isIpfs && profile.content.asIpfs

          const content = cid ? await ipfs.findProfile(cid) : undefined

          dispatch({ type: 'setAccount', account: { struct, profile, content } })
        }

      })
    }

    sub()

    return () => { unsub && unsub() }

  }, [ inited, address || '' ])

  const contextValue = {
    state,
    dispatch,
    setAddress: (address: string) => dispatch({ type: 'setAddress', address }),
    signOut: () => dispatch({ type: 'forget' })
  };
  return (
    <MyAccountContext.Provider value={contextValue}>
      {props.children}
    </MyAccountContext.Provider>
  );
}

export function useMyAccount () {
  return useContext(MyAccountContext);
}

export function useMyAddress () {
  return useMyAccount().state.address
}

export function isMyAddress (anotherAddress?: string | AccountId) {
  return equalAddresses(useMyAddress(), anotherAddress)
}

export function useIsSignIn () {
  return nonEmptyStr(useMyAddress())
}

export function notSignIn () {
  return !useIsSignIn()
}

export default MyAccountProvider;
