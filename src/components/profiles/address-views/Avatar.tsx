import React from 'react'
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar';
import { CopyAddress } from './utils';

export const Avatar: React.FunctionComponent<BaseAvatarProps> = (props) => {
  return <CopyAddress address={props.address}><BaseAvatar {...props} /></CopyAddress>
};

export default Avatar;
