import React from 'react'
import { toShortAddress } from '@polkadot/react-components/util';
import { CommonAddressProps } from './utils/types';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';

type AddressProps = CommonAddressProps & {
  isShort?: boolean,
  asLink?: boolean,
  className?: string
};

export const Name: React.FunctionComponent<AddressProps> = ({ isShort = true, address, owner = {} as ProfileData, className }) => {
  const { content, profile } = owner;
  return (
    <Link href={'/profile/[address]'} as={`/profile/${address}`}>
      <a className={`ui--AddressComponents-address ${className} `}>
        {content?.fullname || profile?.username || (isShort ? toShortAddress(address) : address)}
      </a>
    </Link>
  );
};

export const NameWithOwner = withLoadedOwner(Name);

export default Name;
