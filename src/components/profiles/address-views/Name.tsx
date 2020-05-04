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

type GetNameOptions = AddressProps & {
  isShort?: boolean
}

export const getProfileName = (options: GetNameOptions) => {
  const { owner, isShort = true, address } = options;
  return owner?.content?.fullname || owner?.profile?.username || (isShort ? toShortAddress(address) : address)
}

export const Name: React.FunctionComponent<Props> = ({ isShort = true, asLink = true, address, owner = {} as ProfileData, className }) => {
  const { profile } = owner;
  const username = profile?.username;
  const addressString = address.toString();

  const name = getProfileName({ address, isShort, owner })

  const queryId = username ? `@${username}` : addressString;

  return asLink
    ? <Link href={'/profile/[address]'} as={`/profile/${queryId}`}>
      <a className={`ui--AddressComponents-address ${className} `}>
        {name}
      </a>
    </Link>
    : <>{name}</>
};

export const NameWithOwner = withLoadedOwner(Name);

export default Name;
