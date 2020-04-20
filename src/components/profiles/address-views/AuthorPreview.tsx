import React from 'react'
import { ProfileData } from '@subsocial/types';
import classes from '@polkadot/react-components/util/classes';
import { BareProps } from '@polkadot/react-api/types';
import { Popover } from 'antd';
import Avatar from './Avatar';
import ProfilePreview from './ProfilePreview';
import Link from 'next/link';
import { toShortAddress } from '@polkadot/react-components/util';
import dynamic from 'next/dynamic';
import Balance from './utils/DfBalance'
import AccountId from '@polkadot/types/generic/AccountId';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { CommonAddressProps } from './utils/types';

type InfoProps = {
  details?: JSX.Element,
  address?: string | AccountId
}
const InfoDetails: React.FunctionComponent<InfoProps> = ({ details, address }) => {
  return <>
    <div className='Df--AddressComponents-details'>
      {address && <>
        <Balance address={address.toString()} />
        {' · '}
      </>}
      {details}
    </div>
  </>;
}

const FollowAccountButton = dynamic(() => import('../../utils/FollowAccountButton'), { ssr: false });

export type Props = BareProps & CommonAddressProps & {
  children?: React.ReactNode,
  details?: JSX.Element
  isPadded?: boolean,
  isShort?: boolean,
  size?: number,
  withFollowButton?: boolean,
};

export const AuthorPreview = (props: Props) => {
  const {
    address,
    owner = {} as ProfileData,
    className,
    isPadded = true,
    style,
    size,
    withFollowButton,
    children,
    details
  } = props;

  const username = owner.profile?.username;
  const avatar = owner.content?.avatar
  const fullname = owner.content?.fullname

  return <div
    className={classes('ui--AddressComponents', isPadded ? 'padded' : '', className)}
    style={style}
  >
    <div className='ui--AddressComponents-info'>
      <Avatar size={size || 36} address={address} avatar={avatar} />
      <div className='DfAddressMini-popup'>
        <Popover
          trigger='focus'
          content={<ProfilePreview address={address} owner={owner}/>}
        >
          <Link
            href={`/profile/${address}`}
          >
            <a className={`ui--AddressComponents-address ${className}`}>
              {fullname || username || toShortAddress(address)}
            </a>
          </Link>
        </Popover>
        <InfoDetails details={details}/>
      </div>
      {children}
    </div>
    {withFollowButton && <FollowAccountButton address={address} />}
  </div>;
};

export const AuthorPreviewWithOwner = withLoadedOwner(AuthorPreview);

export default AuthorPreviewWithOwner;

// ${asActivity && 'activity'}
