import { toShortAddress } from 'src/components/utils';
import { ProfileData } from '@subsocial/types';
import { nonEmptyStr } from '@subsocial/utils';
import dynamic from 'next/dynamic';
import React from 'react';
import { isMyAddress } from 'src/components/auth/MyAccountContext';
import MyEntityLabel from 'src/components/utils/MyEntityLabel';
import { InfoDetails } from '../AuthorPreview';
import { AddressProps } from './types';
import { useExtensionName } from '.';
import Name from '../Name';

const FollowAccountButton = dynamic(() => import('../../../utils/FollowAccountButton'), { ssr: false });

type Props = AddressProps & {
  withFollowButton?: boolean,
  withLabel?: boolean,
  withDetails?: boolean
}

export const NameDetails = ({
  owner = {} as ProfileData,
  address,
  withFollowButton = true,
  withLabel,
  withDetails = true
}: Props) => {

  const { content, struct } = owner
  const isMyAccount = isMyAddress(address)
  const shortAddress = toShortAddress(address)
  const extensionName = useExtensionName(address)

  let subtitle = null

  if (content && nonEmptyStr(content.name)) {
    subtitle = extensionName
      ? <>
        <div>{extensionName}</div>
        <div>{shortAddress}</div>
      </>
      : shortAddress
  }

  return <>
    <div className='header DfAccountTitle'>
      <Name owner={owner} address={address} />
      {withLabel && <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>}
      {withFollowButton && <FollowAccountButton address={address} className='ml-3' />}
    </div>
    {subtitle && <div className='DfPopup-handle'>{subtitle}</div>}
    {withDetails && <InfoDetails address={address} details={<>Reputation: {struct?.reputation?.toString() || 0}</>} />}
  </>
}

export default NameDetails;
