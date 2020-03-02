import React from 'react';
import { withMulti } from '@polkadot/react-api/with';

import { useMyAccount } from './MyAccountContext';

export type MyAddressProps = {
  myAddress?: string
};

export type MyAccountProps = MyAddressProps;

function withMyAddress<P extends MyAccountProps> (Component: React.ComponentType<P>) {
  return function (props: P) {
    const { state: { address } } = useMyAccount();
    return <Component myAddress={address} {...props} />;
  };
}

export const withMyAccount = <P extends MyAccountProps> (Component: React.ComponentType<P>) =>
  withMulti(
    Component,
    withMyAddress
  );
