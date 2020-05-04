import React from 'react'
import Link from 'next/link';
import { AddressProps } from './types';
import { toShortAddress } from '@polkadot/react-components/util';
import { ProfileData } from '@subsocial/types';
import { InfoDetails } from '../AuthorPreview';
import { nonEmptyStr } from '@subsocial/utils';
import { isMyAddress } from 'src/components/utils/MyAccountContext';
import MyEntityLabel from 'src/components/utils/MyEntityLabel';
import { accountUrl } from 'src/components/utils/urls';

export const NameDetails = ({ owner = {} as ProfileData, address }: AddressProps) => {
  const { profile, content, struct } = owner
  const isMyAccount = isMyAddress(address)
  const shortAddress = toShortAddress(address)
  const username = profile?.username?.toString()

  let title = ''
  let subtitle = ''

  if (content && nonEmptyStr(content.fullname)) {
    title = content.fullname
    subtitle = nonEmptyStr(username) ? `@${username} · ${shortAddress}` : shortAddress
  } else if (nonEmptyStr(username)) {
    title = `@${username}`
    subtitle = shortAddress
  } else {
    title = shortAddress
  }

  return <>
    <div className='header DfAccountTitle'>
      <Link href='/profile/[address]' as={accountUrl({ address, username })}>
        <a className='ui--AddressComponents-address'>{title}</a>
      </Link>
      <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>
    </div>
    {nonEmptyStr(subtitle) && <div className='DfPopup-username'>{subtitle}</div>}
    <InfoDetails address={address} details={<>Reputation: {struct?.reputation?.toString() || 0}</>} />
  </>
}

export default NameDetails;
