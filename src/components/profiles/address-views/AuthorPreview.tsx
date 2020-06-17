import React from 'react'
import { ProfileData } from '@subsocial/types';
import classes from '@subsocial/react-components/util/classes';
import { Popover } from 'antd';
import Avatar from './Avatar';
import ProfilePreview from './ProfilePreview';
import { toShortAddress } from '@subsocial/react-components/util';
import AccountId from '@polkadot/types/generic/AccountId';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { ExtendedAddressProps } from './utils/types';
import dynamic from 'next/dynamic';
import { useApi } from '@subsocial/react-hooks';
import ViewProfileLink from '../ViewProfileLink';

const Balance = dynamic(() => import('./utils/DfBalance'), { ssr: false });

export type InfoProps = {
  address?: string | AccountId
  details?: JSX.Element
}

export const InfoDetails: React.FunctionComponent<InfoProps> = ({ details, address }) => {
  const { isApiReady } = useApi()
  return <>
    <div className='Df--AddressComponents-details'>
      {address && isApiReady &&
        <Balance address={address.toString()} />
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
    className={classes('ui--AddressComponents', isPadded ? 'padded' : '', className)}
    style={style}
  >
    <div className='ui--AddressComponents-info'>
      <Avatar size={size} address={address} avatar={avatar} />
      <div className='DfAddressMini-popup'>
        <Popover
          trigger='hover'
          content={<ProfilePreview address={address} owner={owner}/>}
        >
          <span>
            <ViewProfileLink account={{ address, username }} title={name} className={nameClass} />
          </span>
        </Popover>
        <InfoDetails details={details}/>
      </div>
      {children}
    </div>
  </div>
}

export const AuthorPreviewWithOwner = withLoadedOwner(AuthorPreview);

export default AuthorPreviewWithOwner;
