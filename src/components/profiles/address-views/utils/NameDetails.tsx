import React from 'react'
import { AddressProps } from './types';
import { toShortAddress } from '@polkadot/react-components/util';
import Link from 'next/link';
import { ProfileData } from '@subsocial/types';
import { InfoDetails } from '../AuthorPreview';
import { nonEmptyStr } from '@subsocial/utils';
import { isMyAddress } from 'src/components/utils/MyAccountContext';
import MyEntityLabel from 'src/components/utils/MyEntityLabel';

export const NameDetails: React.FunctionComponent<AddressProps> = ({ owner = {} as ProfileData, address }) => {
  const shortAddress = toShortAddress(address);
  const { profile, content, struct } = owner
  const isMyAccount = isMyAddress(address)

  let title = ''
  let subtitle = ''

  if (content && nonEmptyStr(content.fullname)) {
    title = content.fullname
    subtitle = nonEmptyStr(profile?.username) ? `@${profile?.username} · ${shortAddress}` : shortAddress
  } else if (nonEmptyStr(profile?.username)) {
    title = `@${profile?.username}`
    subtitle = shortAddress
  } else {
    title = shortAddress
  }

  const queryId = profile?.username ? `@${profile.username}` : address.toString()

  return <>
    <div className='header DfAccountTitle'>
      <Link href='/profile/[address]' as={`/profile/${queryId}`}>
        <a className='ui--AddressComponents-address'>{title}</a>
      </Link>
      <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>
    </div>
    {nonEmptyStr(subtitle) && <div className='DfPopup-username'>{subtitle}</div>}
    <InfoDetails address={address} details={<>Reputation: {struct?.reputation.toString() || 0}</>} />
  </>
}

export default NameDetails;
