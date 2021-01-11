import React, { CSSProperties } from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { DfBgImg } from 'src/components/utils/DfBgImg'
import IdentityIcon from 'src/components/utils/IdentityIcon'
import { AnyAccountId } from '@subsocial/types/substrate'
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config'

export type BaseAvatarProps = {
  size?: number,
  style?: CSSProperties,
  avatar?: string
  address: AnyAccountId,
}

const avatarCss = 'DfAvatar space ui--IdentityIcon'

export const BaseAvatar = (props: BaseAvatarProps) => {
  const { size = DEFAULT_AVATAR_SIZE, avatar, style, address } = props

  if (!avatar || isEmptyStr(avatar)) {
    return <IdentityIcon style={style} size={size} value={address} />
  }
  
  return <DfBgImg style={style} size={size} src={avatar} className={avatarCss} rounded />
}

export default BaseAvatar
