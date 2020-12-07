import React from 'react'
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import { SpaceStruct } from 'src/types'
import ViewSpaceLink from '../ViewSpaceLink'

type Props = BaseAvatarProps & {
  space: SpaceStruct
  asLink?: boolean
}

export const SpaceAvatar = ({ asLink = true, ...props }: Props) => asLink
  ? <ViewSpaceLink space={props.space} title={<BaseAvatar {...props} />} />
  : <BaseAvatar {...props} />
