import React, { useReducer, createContext, useContext, useEffect } from 'react';
import store from 'store';
import { newLogger, nonEmptyStr } from '@subsocial/utils';
import { AccountId } from '@polkadot/types/interfaces';
import { equalAddresses } from './substrate';
import { InjectedAccountExt } from './types';

const log = newLogger('MyAccountContext')

export const MY_ADDRESS = 'df.myAddress';
const INJECT_ACCOUNT = 'df.injectAccounts';

export function readMyAddress (): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS);
  log.info('Read my address from the local storage:', myAddress);
  return myAddress;
}

export function readInjectedAccounts (): InjectedAccountExt[] {
  const injectedAccounts: InjectedAccountExt[] | undefined = store.get(INJECT_ACCOUNT);
  log.info('Read injected accounts from the local storage:', injectedAccounts);
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
    log.info('Forget my address');
    store.remove(MY_ADDRESS);
    return { ...state, address: undefined };
  }

  let address: string | undefined;
  let injectedAccounts: InjectedAccountExt[] | undefined;

  switch (action.type) {
    case 'reload':
      address = readMyAddress();
      injectedAccounts = readInjectedAccounts()
      log.info('Reload my address:', address);
      return { ...state, address, injectedAccounts, inited: true };

    case 'setAddress':
      address = action.address;
      if (address !== state.address) {
        if (address) {
          log.info('Set my new address:', address);
          store.set(MY_ADDRESS, address);
          return { ...state, address, inited: true };
        } else {
          return forget();
        }
      }
      return state;

    case 'setInjectedAccounts':
      injectedAccounts = action.injectedAccounts;
      if (injectedAccounts !== state.injectedAccounts) {
        if (injectedAccounts) {
          log.info('Set new injected accounts:', injectedAccounts);
          store.set(INJECT_ACCOUNT, injectedAccounts);
          return { ...state, injectedAccounts };
        } else {
          return forget();
        }
      }
      return state;

    case 'forget':
      address = action.address;
      const isMyAddress = address && address === readMyAddress();
      if (!address || isMyAddress) {
        return forget();
      }
      return state;

    default:
      throw new Error('No action type provided');
  }
}

function functionStub () {
  log.error('Function needs to be set in MyAccountProvider');
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
  forget: (address: string) => void
};

const contextStub: MyAccountContextProps = {
  state: initialState,
  dispatch: functionStub,
  setAddress: functionStub,
  setInjectedAccounts: functionStub,
  forget: functionStub
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
    forget: (address: string) => dispatch({ type: 'forget', address })
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

export function useIsLoggedIn () {
  return nonEmptyStr(useMyAddress())
}

export function notLoggedIn () {
  return !useIsLoggedIn()
}

export default MyAccountProvider;
