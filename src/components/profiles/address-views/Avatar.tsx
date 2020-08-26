import React from 'react'
import ViewProfileLink from '../ViewProfileLink';
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar';

export const Avatar: React.FunctionComponent<BaseAvatarProps> = (props) => {
  return <ViewProfileLink
    account={{ address: props.address }}
    title={<BaseAvatar {...props} />}
  />
};

export default Avatar;
