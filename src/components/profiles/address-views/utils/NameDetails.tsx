import React from 'react'
import { AddressProps } from './types';
import { toShortAddress } from '@polkadot/react-components/util';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';
import { InfoDetails } from '../AuthorPreview';

export const NameDetails: React.FunctionComponent<AddressProps> = ({ owner = {} as ProfileData, address }) => {
  const shortAddress = toShortAddress(address);
  const { profile, content, struct } = owner
  return (
    <Link href='/profile/[address]' as={`/profile/${address}`}>
      <a className='ui--AddressComponents-address'>
        <span className='AddressComponents-fullname'>{content?.fullname || shortAddress}</span>
        <InfoDetails address={address} details={<>Repupation: {struct.reputation.toString()}</>} />
        <div className='DfPopup-username'>{profile?.username && `${profile?.username} - `}{shortAddress}</div>
      </a>
    </Link>
  );
};

export default NameDetails;
