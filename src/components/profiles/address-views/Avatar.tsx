import React from 'react'
import { nonEmptyStr } from '@subsocial/utils';
import { DfBgImg } from 'src/components/utils/DfBgImg';
import { IdentityIcon } from '@polkadot/react-components';
import { AccountId } from '@polkadot/types/interfaces';
import { withLoadedAuthor } from './utils/withLoadedAuthor';

type ImageProps = {
  size: number,
  style?: any,
  address: string | AccountId,
  avatar?: string
};

export const Avatar: React.FunctionComponent<ImageProps> = ({ size, avatar, address, style }) => {
  return avatar && nonEmptyStr(avatar)
    ? <DfBgImg size={size} src={avatar} className='DfAvatar ui--IdentityIcon' style={style} rounded />
    : <IdentityIcon
      style={style}
      size={size}
      value={address}
    />;
};

export const AvatarWithAuthor = withLoadedAuthor(Avatar);

export default AvatarWithAuthor;
