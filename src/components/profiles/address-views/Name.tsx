import React from 'react'
import { toShortAddress } from 'src/components/utils';
import { AddressProps } from './utils/types';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
import ViewProfileLink from '../ViewProfileLink';
import { useExtensionName } from './utils';

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
  const handle = profile?.handle?.toString()

  // TODO extract a function? (find similar copypasta in other files):
  const addressString = isShort ? toShortAddress(address) : address.toString()
  const name = fullname || handle || useExtensionName(address) || addressString
  const nameClass = `ui--AddressComponents-address ${className}`

  return asLink
    ? <ViewProfileLink account={{ address, handle }} title={name} className={nameClass} />
    : <>{name}</>
}

export const NameWithOwner = withLoadedOwner(Name);

export default Name;
