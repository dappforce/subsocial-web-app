import React from 'react'
import { AddressProps } from './types';
import { toShortAddress } from '@polkadot/react-components/util';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';
import { InfoDetails } from '../AuthorPreview';
import { nonEmptyStr } from '@subsocial/utils';

export const NameDetails: React.FunctionComponent<AddressProps> = ({ owner = {} as ProfileData, address }) => {
  const shortAddress = toShortAddress(address);
  const { profile, content, struct } = owner
  let title = ''
  let subtitle = ''

  if (content && nonEmptyStr(content.fullname)) {
    title = content?.fullname
    subtitle = nonEmptyStr(profile?.username) ? `@${profile?.username} - ${shortAddress}` : shortAddress
  } else if (nonEmptyStr(profile?.username)) {
    title = `@${profile?.username}`
    subtitle = shortAddress
  } else {
    title = shortAddress
  }

  return (
    <Link href='/profile/[address]' as={`/profile/${address}`}>
      <a className='ui--AddressComponents-address'>
        <span className='AddressComponents-fullname'>{title}</span>
        <InfoDetails address={address} details={<>Repupation: {struct.reputation.toString()}</>} />
        nonEmptyStr(subTitle) <div className='DfPopup-username'>{subtitle}</div>
      </a>
    </Link>
  );
};

export default NameDetails;
