import React from 'react'
import { toShortAddress } from '@polkadot/react-components/util';
import { AddressProps } from './utils/types';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';

type Props = AddressProps & {
  isShort?: boolean,
  asLink?: boolean,
  className?: string
};

export const Name: React.FunctionComponent<Props> = ({ isShort = true, asLink = true, address, owner = {} as ProfileData, className }) => {
  const { content, profile } = owner;
  const name = content?.fullname || profile?.username || (isShort ? toShortAddress(address) : address)
  return asLink
    ? <Link href={'/profile/[address]'} as={`/profile/${address}`}>
      <a className={`ui--AddressComponents-address ${className} `}>
        {name}
      </a>
    </Link>
    : <>{name}</>
};

export const NameWithOwner = withLoadedOwner(Name);

export default Name;
