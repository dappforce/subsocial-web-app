import React, { CSSProperties } from 'react'
import { nonEmptyStr } from '@subsocial/utils'
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

export const BaseAvatar = ({ size = DEFAULT_AVATAR_SIZE, avatar, style, address }: BaseAvatarProps) => {
  const icon = nonEmptyStr(avatar)
    ? <DfBgImg size={size} src={avatar} className='DfAvatar space ui--IdentityIcon' style={style} rounded />
    : <IdentityIcon
      style={style}
      size={size}
      value={address}
    />

  if (!icon) return null

  return icon
}

export default BaseAvatar
