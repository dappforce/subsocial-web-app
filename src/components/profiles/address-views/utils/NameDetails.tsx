import React from 'react'
import { CommonAddressProps } from './types';
import { toShortAddress } from '@polkadot/react-components/util';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';

export const NameDetails: React.FunctionComponent<CommonAddressProps> = ({ owner = {} as ProfileData, address }) => {
  const shortAddress = toShortAddress(address);
  const { profile, content } = owner
  return (
    <Link href='/profile/[address]' as={`/profile/${address}`}>
      <a className='ui--AddressComponents-address'>
        <span className='AddressComponents-fullname'>{content?.fullname || shortAddress}</span>
        <div className='DfPopup-username'>{profile?.username && `${profile?.username} - `}{shortAddress}</div>
      </a>
    </Link>
  );
};

export default NameDetails;
