import React, { FC } from 'react'
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import { CopyAddress } from './utils'

export const Avatar: FC<BaseAvatarProps> = (props) => {
  return <CopyAddress address={props.address}><BaseAvatar {...props} /></CopyAddress>
}

export default Avatar
