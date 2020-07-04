import React, { useReducer, createContext, useContext, useEffect } from 'react';
import store from 'store';
import { newLogger, nonEmptyStr } from '@subsocial/utils';
import { AccountId } from '@polkadot/types/interfaces';
import { equalAddresses } from '../utils/substrate';
import { InjectedAccountExt } from '../utils/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';

const log = newLogger('MyAccountContext')

function print (x?: any): string {
  return typeof x?.toString === 'function' ? x.toString() : ''
}

const MY_ADDRESS = 'df.myAddress';
const INJECTED_ACCOUNTS = 'df.injectedAccounts';

export function readMyAddress (): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS);
  log.info(`Read my address from the local storage: ${print(myAddress)}`);
  return myAddress;
}

export function readInjectedAccounts (): InjectedAccountExt[] {
  const injectedAccounts: InjectedAccountExt[] | undefined = store.get(INJECTED_ACCOUNTS);
  log.info(`Read injected accounts from the local storage: ${print(injectedAccounts)}`);
  return injectedAccounts || [];
}

type MyAccountState = {
  inited: boolean,
  address?: string,
  injectedAccounts: InjectedAccountExt[]
};

type MyAccountAction = {
  type: 'reload' | 'setAddress' | 'setInjectedAccounts' | 'forget' | 'forgetExact',
  address?: string,
  injectedAccounts?: InjectedAccountExt[]
};

function reducer (state: MyAccountState, action: MyAccountAction): MyAccountState {
  function forget () {
    log.info('Forget my address and injected accounts');
    store.remove(MY_ADDRESS);
    store.remove(INJECTED_ACCOUNTS)
    return { ...state, address: undefined };
  }

  let address: string | undefined;
  let injectedAccounts: InjectedAccountExt[] | undefined;

  switch (action.type) {
    case 'reload':
      address = readMyAddress();
      injectedAccounts = readInjectedAccounts();
      const isSignInWithPolkadotExt = !!(injectedAccounts.find((x) => x.address === address))

      if (isSignInWithPolkadotExt && !isWeb3Injected) { return forget() }

      log.info(`Reload my address: ${print(address)}`);
      return { ...state, address, injectedAccounts, inited: true };

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

    case 'setInjectedAccounts':
      injectedAccounts = action.injectedAccounts;
      if (state.injectedAccounts.length === 0) {
        if (injectedAccounts) {
          log.info(`Set injected accounts: ${print(injectedAccounts)}`);
          store.set(INJECTED_ACCOUNTS, injectedAccounts);
          return { ...state, injectedAccounts };
        } else {
          return state
        }
      }
      return state;

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
  address: undefined,
  injectedAccounts: []
};

export type MyAccountContextProps = {
  state: MyAccountState,
  dispatch: React.Dispatch<MyAccountAction>,
  setAddress: (address: string) => void,
  setInjectedAccounts: (injectedAccounts: InjectedAccountExt[]) => void,
  signOut: () => void
};

const contextStub: MyAccountContextProps = {
  state: initialState,
  dispatch: functionStub,
  setAddress: functionStub,
  setInjectedAccounts: functionStub,
  signOut: functionStub
};

export const MyAccountContext = createContext<MyAccountContextProps>(contextStub);

export function MyAccountProvider (props: React.PropsWithChildren<{}>) {
  const [ state, dispatch ] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.inited) {
      dispatch({ type: 'reload' });
    }
  }, [ state.inited ]); // Don't call this effect if `invited` is not changed

  const contextValue = {
    state,
    dispatch,
    setAddress: (address: string) => dispatch({ type: 'setAddress', address }),
    setInjectedAccounts: (injectedAccounts: InjectedAccountExt[]) => dispatch({ type: 'setInjectedAccounts', injectedAccounts }),
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
