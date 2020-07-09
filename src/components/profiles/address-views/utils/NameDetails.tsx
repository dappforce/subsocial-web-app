import { toShortAddress } from 'src/components/utils';
import { ProfileData } from '@subsocial/types';
import { nonEmptyStr } from '@subsocial/utils';
import dynamic from 'next/dynamic';
import React from 'react';
import { isMyAddress } from 'src/components/auth/MyAccountContext';
import MyEntityLabel from 'src/components/utils/MyEntityLabel';
import { InfoDetails } from '../AuthorPreview';
import { AddressProps } from './types';
import ViewProfileLink from '../../ViewProfileLink';

const FollowAccountButton = dynamic(() => import('../../../utils/FollowAccountButton'), { ssr: false });

type Props = AddressProps & {
  withFollowButton?: boolean,
  withLabel?: boolean
}

export const NameDetails = ({
  owner = {} as ProfileData,
  address,
  withFollowButton = true,
  withLabel
}: Props) => {

  const { profile, content, struct } = owner
  const isMyAccount = isMyAddress(address)
  const shortAddress = toShortAddress(address)
  const username = profile?.username?.toString()

  let title = ''
  let subtitle = null

  if (content && nonEmptyStr(content.fullname)) {
    title = content.fullname
    subtitle = username
      ? <>
        <div>{username}</div>
        <div>{shortAddress}</div>
      </>
      : shortAddress
  } else if (nonEmptyStr(username)) {
    title = `@${username}`
    subtitle = shortAddress
  } else {
    title = shortAddress
  }

  return <>
    <div className='header DfAccountTitle'>
      <ViewProfileLink account={{ address, username }} title={title} className='ui--AddressComponents-address' />
      {withLabel && <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>}
      {withFollowButton && <FollowAccountButton address={address} className='ml-3' />}
    </div>
    {subtitle && <div className='DfPopup-username'>{subtitle}</div>}
    <InfoDetails address={address} details={<>Reputation: {struct?.reputation?.toString() || 0}</>} />
  </>
}

export default NameDetails;
