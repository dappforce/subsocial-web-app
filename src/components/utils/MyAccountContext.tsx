import React, { useReducer, createContext, useContext, useEffect } from 'react';
import store from 'store';
import { newLogger, nonEmptyStr } from '@subsocial/utils';

const log = newLogger('MyAccountContext')

export const MY_ADDRESS = 'df.myAddress';

export function readMyAddress (): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS);
  log.info('Read my address from the local storage:', myAddress);
  return myAddress;
}

type MyAccountState = {
  inited: boolean,
  address?: string
};

type MyAccountAction = {
  type: 'reload' | 'set' | 'forget' | 'forgetExact',
  address?: string
};

function reducer (state: MyAccountState, action: MyAccountAction): MyAccountState {
  function forget () {
    log.info('Forget my address');
    store.remove(MY_ADDRESS);
    return { ...state, address: undefined };
  }

  let address: string | undefined;

  switch (action.type) {
    case 'reload':
      address = readMyAddress();
      log.info('Reload my address:', address);
      return { ...state, address, inited: true };

    case 'set':
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
  address: undefined
};

export type MyAccountContextProps = {
  state: MyAccountState,
  dispatch: React.Dispatch<MyAccountAction>,
  set: (address: string) => void,
  forget: (address: string) => void
};

const contextStub: MyAccountContextProps = {
  state: initialState,
  dispatch: functionStub,
  set: functionStub,
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
    set: (address: string) => dispatch({ type: 'set', address }),
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

export function useIsLoggedIn () {
  return nonEmptyStr(useMyAddress())
}

export default MyAccountProvider;
