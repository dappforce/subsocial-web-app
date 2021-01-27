import React from 'react'
import { ProfileData } from '@subsocial/types';
import { Popover } from 'antd';
import Avatar from './Avatar';
import ProfilePreview from './ProfilePreview';
import AccountId from '@polkadot/types/generic/AccountId';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { ExtendedAddressProps } from './utils/types';
import BN from 'bn.js'
import { Balance } from './utils/Balance';
import { Name } from './Name';
import { KusamaIdentityTooltip } from 'src/components/kusama/KusamaIdentity';

export type InfoProps = {
  address?: string | AccountId,
  balance?: string | BN | number,
  details?: JSX.Element
}

export const InfoDetails: React.FunctionComponent<InfoProps> = ({
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
    afterName,
    details,
    children
  } = props;

  const avatar = owner.content?.avatar

  // TODO extract a function? (find similar copypasta in other files):
  // const nameClass = `ui--AddressComponents-address ${className}`

  return <div
    className={`ui--AddressComponents ${isPadded ? 'padded' : ''} ${className}`}
    style={style}
  >
    <div className='ui--AddressComponents-info d-flex'>
      <Avatar size={size} address={address} avatar={avatar} />
      <div className='DfAddressMini-popup'>
        <span className='d-flex'>
          <Popover
            placement='topLeft'
            trigger='hover'
            mouseEnterDelay={0.3}
            content={<ProfilePreview address={address} owner={owner} />}
          >
            <span className='d-flex align-items-center'>
              <Name address={address} owner={owner} isShort={isShort} withKusama={false} />
              {afterName && <span className='ml-2'>{afterName}</span>}
            </span>
          </Popover>
          <KusamaIdentityTooltip address={address} />
        </span>
        <InfoDetails details={details}/>
      </div>
      {children}
    </div>
  </div>
}

export const AuthorPreviewWithOwner = withLoadedOwner(AuthorPreview);

export default AuthorPreviewWithOwner;
