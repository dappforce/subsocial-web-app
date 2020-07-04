import React from 'react'
import { nonEmptyStr } from '@subsocial/utils';
import { DfBgImg } from 'src/components/utils/DfBgImg';
import IdentityIcon from '@polkadot/react-identicon';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { AnyAccountId } from '@subsocial/types/substrate';
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config';
import ViewProfileLink from '../ViewProfileLink';

type ImageProps = {
  size?: number,
  style?: any,
  address: AnyAccountId,
  avatar?: string
};

export const Avatar: React.FunctionComponent<ImageProps> = ({ size = DEFAULT_AVATAR_SIZE, avatar, address, style }) => {
  const icon = avatar && nonEmptyStr(avatar)
    ? <DfBgImg size={size} src={avatar} className='DfAvatar space ui--IdentityIcon' style={style} rounded />
    : <IdentityIcon
      style={{ ...style, marginRight: '.5rem', cursor: 'pointer' }}
      size={size}
      value={address}
    />;

  if (!icon) return null

  return <ViewProfileLink account={{ address }} title={icon} />

};

export const AvatarWithOwner = withLoadedOwner(Avatar);

export default Avatar;
