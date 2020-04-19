import React from 'react'
import { CommonAddressProps } from './types';
import { toShortAddress } from '@polkadot/react-components/util';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';

export const NameDetails: React.FunctionComponent<CommonAddressProps> = ({ author = {} as ProfileData, address }) => {
  const shortAddress = toShortAddress(address);
  const { profile, content } = author
  return (
    <Link href='/profile/[address]' as={`/profile/${address}`}>
      <a className='ui--AddressComponents-address'>
        <b className='AddressComponents-fullname'>{content?.fullname || shortAddress}</b>
        <div className='DfPopup-username'>{profile?.username && `${profile?.username} - `}{shortAddress}</div>
      </a>
    </Link>
  );
};

export default NameDetails;
