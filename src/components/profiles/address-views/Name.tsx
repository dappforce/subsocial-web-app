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

export const Name = ({
  address,
  owner = {} as ProfileData,
  isShort = true,
  asLink = true,
  className
}: Props) => {

  const { content, profile } = owner
  const username = profile?.username?.toString()

  // TODO extract a function? (find similar copypasta in other files):
  const addressString = isShort ? toShortAddress(address) : address.toString()

  const name = content?.fullname || username || addressString

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
