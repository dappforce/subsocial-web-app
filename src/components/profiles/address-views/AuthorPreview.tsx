import React, { FC } from 'react'
import { ProfileData } from 'src/types'
import { Popover } from 'antd'
import Avatar from './Avatar'
import ProfilePreview from './ProfilePreview'
import AccountId from '@polkadot/types/generic/AccountId'
import { withLoadedOwner } from './utils/withLoadedOwner'
import { ExtendedAddressProps } from './utils/types'
import BN from 'bn.js'
import { Balance } from './utils/Balance'
import Name from './Name'

export type InfoProps = {
  address?: string | AccountId,
  balance?: string | BN | number,
  details?: JSX.Element
}

export const InfoDetails: FC<InfoProps> = ({
  details, balance, address
}) => {
  return <>
    <div className='Df--AddressComponents-details'>
      {balance ||
        (address &&
          <Balance address={address.toString()} />)
      }
      {details && <div>{details}</div>}
    </div>
  </>
}

export const AuthorPreview = (props: ExtendedAddressProps) => {
  const {
    address,
    owner = {} as ProfileData,
    className,
    isPadded = true,
    style,
    size,
    afterName,
    details,
    children
  } = props

  const avatar = owner.content?.avatar

  const nameClass = `ui--AddressComponents-address ${className}`

  return <div
    className={`ui--AddressComponents ${isPadded ? 'padded' : ''} ${className}`}
    style={style}
  >
    <div className='ui--AddressComponents-info d-flex'>
      <Avatar size={size} address={address} avatar={avatar} />
      <div className='DfAddressMini-popup'>
        <Popover
          trigger='hover'
          mouseEnterDelay={0.3}
          content={<ProfilePreview address={address} owner={owner} />}
        >
          <div className='d-block'>
            <Name
              address={address}
              owner={owner}
              className={nameClass}
              asLink
            />
            {afterName && <span className='ml-2'>{afterName}</span>}
          </div>
        </Popover>
        <InfoDetails details={details}/>
      </div>
      {children}
    </div>
  </div>
}

export const AuthorPreviewWithOwner = withLoadedOwner(AuthorPreview)

export default AuthorPreview
