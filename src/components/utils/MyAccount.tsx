import React from 'react';
import { withMulti } from '../substrate';
import { useMyAddress } from '../auth/MyAccountContext';

export type MyAddressProps = {
  address?: string
};

export type MyAccountProps = MyAddressProps;

function withMyAddress<P extends MyAccountProps> (Component: React.ComponentType<P>) {
  return function (props: P) {
    const myAddress = useMyAddress();
    return <Component address={myAddress} {...props} />;
  };
}

export const withMyAccount = <P extends MyAccountProps> (Component: React.ComponentType<P>) =>
  withMulti(
    Component,
    withMyAddress
  );
