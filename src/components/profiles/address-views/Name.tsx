import React from 'react'
import { toShortAddress } from 'src/components/utils';
import { AddressProps } from './utils/types';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './utils/withLoadedOwner';
import ViewProfileLink from '../ViewProfileLink';
import { useExtensionName } from './utils';
import { MutedSpan } from 'src/components/utils/MutedText';
import { KusamaIdentityTooltip } from 'src/components/substrate/KusamaContext';

type Props = AddressProps & {
  isShort?: boolean,
  asLink?: boolean,
  withShortAddress?: boolean,
  className?: string
};

export const Name = ({
  address,
  owner = {} as ProfileData,
  isShort = true,
  asLink = true,
  withShortAddress,
  className
}: Props) => {

  const { content } = owner

  // TODO extract a function? (find similar copypasta in other files):
  const shortAddress = toShortAddress(address)
  const addressString = isShort ? shortAddress : address.toString()
  const name = content?.name || useExtensionName(address)
  const title = name
    ? <span className={withShortAddress ? 'd-flex justify-content-between w-100' : ''}>
      {name}
      {withShortAddress && <MutedSpan><code>{shortAddress}</code></MutedSpan>}
    </span>
    : addressString
  const nameClass = `ui--AddressComponents-address ${className}`

  return <span className='d-flex'>
    {asLink
      ? <ViewProfileLink account={{ address }} title={title} className={nameClass} />
      : <>{title}</>}
      <KusamaIdentityTooltip address={address} />
    </span>
}

export const NameWithOwner = withLoadedOwner(Name);

export default Name;
