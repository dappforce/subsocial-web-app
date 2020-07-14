import React from 'react';
import { withMulti } from '../substrate';
import { useMyAccount } from '../auth/MyAccountContext';

export type MyAddressProps = {
  address?: string
};

export type MyAccountProps = MyAddressProps;

function withMyAddress<P extends MyAccountProps> (Component: React.ComponentType<P>) {
  return function (props: P) {
    const { state: { address } } = useMyAccount();
    return <Component address={address} {...props} />;
  };
}

export const withMyAccount = <P extends MyAccountProps> (Component: React.ComponentType<P>) =>
  withMulti(
    Component,
    withMyAddress
  );
