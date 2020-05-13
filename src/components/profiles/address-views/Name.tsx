import React from 'react'
import Link from 'next/link';
import { toShortAddress } from '@subsocial/react-components/util';
import { AddressProps } from './utils/types';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
import ViewProfileLink from '../ViewProfileLink';

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
  const fullname = content?.fullname
  const username = profile?.username?.toString()

  // TODO extract a function? (find similar copypasta in other files):
  const addressString = isShort ? toShortAddress(address) : address.toString()
  const name = fullname || username || addressString
  const nameClass = `ui--AddressComponents-address ${className}`

  return asLink
    ? <ViewProfileLink account={{ address, username }} title={name} className={nameClass} />
    : <>{name}</>
}

export const NameWithOwner = withLoadedOwner(Name);

export default Name;
