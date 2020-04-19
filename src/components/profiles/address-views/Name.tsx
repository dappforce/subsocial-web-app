import React from 'react'
import { toShortAddress } from '@polkadot/react-components/util';
import { CommonAddressProps } from './utils/types';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';
import { withLoadedAuthor } from './utils/withLoadedAuthor';

type AddressProps = CommonAddressProps & {
  isShort?: boolean,
  asLink?: boolean,
  className?: string
};

export const Name: React.FunctionComponent<AddressProps> = ({ asLink = true, isShort = true, address, author = {} as ProfileData, className }) => {
  const { content, profile } = author;
  return (
    <Link href={'/profile/[address]'} as={`/profile/${address}`}>
      <a className={`ui--AddressComponents-address ${asLink && 'asLink'} ${className} `}>
        {content?.fullname || profile?.username || (isShort ? toShortAddress(address) : address)}
      </a>
    </Link>
  );
};

export const NameWithAuthor = withLoadedAuthor(Name);

export default Name;
