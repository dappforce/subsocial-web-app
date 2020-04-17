import React from 'react'
import Router from 'next/router';
import { toShortAddress } from '@polkadot/react-components/util';
import { ProfileProps } from './types';

type AddressProps = ProfileProps & {
  isShort?: boolean,
  asLink?: boolean,
  className?: string
};

export const Address: React.FunctionComponent<AddressProps> = ({ asLink = true, isShort = true, address, fullname, username, className }) => {
  return (
    <div
      className={`ui--AddressComponents-address ${asLink && 'asLink'} ${className} `} // ${asActivity && 'activity'}
      onClick={() => asLink && Router.push(`/profile/${address}`)}
    >
      {fullname || username || (isShort ? toShortAddress(address) : address)}
    </div>
  );
};

export default Address;
