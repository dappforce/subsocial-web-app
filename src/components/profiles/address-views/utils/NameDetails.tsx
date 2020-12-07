import { toShortAddress } from 'src/components/utils'
import { ProfileData } from 'src/types'
import { nonEmptyStr } from '@subsocial/utils'
import dynamic from 'next/dynamic'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import MyEntityLabel from 'src/components/utils/MyEntityLabel'
import { AddressProps } from './types'
import { CopyAddress, useExtensionName } from '.'
import Name from '../Name'
import { InfoPanel } from '../InfoSection'
import { Balance } from './Balance'

const FollowAccountButton = dynamic(() => import('../../../utils/FollowAccountButton'), { ssr: false })

type Props = AddressProps & {
  withFollowButton?: boolean,
  withLabel?: boolean,
  withDetails?: boolean
}

export const NameDetails = ({
  owner = {} as ProfileData,
  address,
  withFollowButton = true,
  withLabel
}: Props) => {

  const { content, struct } = owner
  const isMyAccount = isMyAddress(address)
  const shortAddress = toShortAddress(address)
  const extensionName = useExtensionName(address)

  const optionItems = []

  if (content && nonEmptyStr(content.name)) {
    optionItems.push({
      label: 'Address',
      value: <CopyAddress address={address}>{shortAddress}</CopyAddress>
    })
  }

  return <>
    <div className='header DfAccountTitle'>
      <Name owner={owner} address={address} />
      {withLabel && <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>}
      {withFollowButton && <FollowAccountButton address={address} className='ml-3 float-right' />}
    </div>
    {extensionName && <div className='DfPopup-handle'>{extensionName}</div>}
    <InfoPanel
      layout='horizontal'
      column={1}
      items={[
        ...optionItems,
        {
          label: 'Balance',
          value: <Balance address={address} />
        },
        {
          label: 'Reputation',
          value: struct?.reputation?.toString() || 0
        }
      ]}
    />
  </>
}

export default NameDetails
