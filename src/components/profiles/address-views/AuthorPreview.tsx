import React from 'react'
import { ProfileData } from '@subsocial/types';
import { Popover } from 'antd';
import Avatar from './Avatar';
import ProfilePreview from './ProfilePreview';
import { toShortAddress } from 'src/components/utils';
import AccountId from '@polkadot/types/generic/AccountId';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { ExtendedAddressProps } from './utils/types';
import dynamic from 'next/dynamic';
import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext';
import ViewProfileLink from '../ViewProfileLink';
import BN from 'bn.js'

const Balance = dynamic(() => import('./utils/DfBalance'), { ssr: false });

export type InfoProps = {
  address?: string | AccountId,
  balance?: string | BN | number,
  details?: JSX.Element
}

export const InfoDetails: React.FunctionComponent<InfoProps> = ({
  details, balance, address
}) => {
  const { isApiReady } = useSubsocialApi()
  return <>
    <div className='Df--AddressComponents-details'>
      {balance ||
        (address && isApiReady &&
          <Balance address={address.toString()} />)
      }
      {details && <div>{details}</div>}
    </div>
  </>;
}

export const AuthorPreview = (props: ExtendedAddressProps) => {
  const {
    address,
    owner = {} as ProfileData,
    className,
    isPadded = true,
    isShort = true,
    style,
    size,
    children,
    details
  } = props;

  const avatar = owner.content?.avatar
  const fullname = owner.content?.fullname
  const username = owner.profile?.username?.toString()

  // TODO extract a function? (find similar copypasta in other files):
  const addressString = isShort ? toShortAddress(address) : address.toString()
  const name = fullname || username || addressString
  const nameClass = `ui--AddressComponents-address ${className}`

  return <div
    className={`ui--AddressComponents' ${isPadded ? 'padded' : ''} ${className}`}
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
            <ViewProfileLink
              account={{ address, username }}
              title={name}
              className={nameClass}
            />
          </div>
        </Popover>
        <InfoDetails details={details}/>
      </div>
      {children}
    </div>
  </div>
}

export const AuthorPreviewWithOwner = withLoadedOwner(AuthorPreview);

export default AuthorPreviewWithOwner;
