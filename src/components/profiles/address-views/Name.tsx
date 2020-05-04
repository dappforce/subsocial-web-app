import React from 'react'
import Link from 'next/link';
import { toShortAddress } from '@polkadot/react-components/util';
import { AddressProps } from './utils/types';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { accountUrl } from 'src/components/utils/urls';

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

  return asLink
    ? <Link href='/profile/[address]' as={accountUrl({ address, username })}>
      <a className={`ui--AddressComponents-address ${className}`}>
        {name}
      </a>
    </Link>
    : <>{name}</>
};

export const NameWithOwner = withLoadedOwner(Name);

export default Name;
