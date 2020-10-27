import React from 'react'
import { HasSpaceIdOrHandle } from 'src/components/urls'
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import ViewSpaceLink from '../ViewSpaceLink'

type Props = BaseAvatarProps & {
  space: HasSpaceIdOrHandle
  asLink?: boolean
}

export const SpaceAvatar = ({ asLink = true, ...props }: Props) => asLink
  ? <ViewSpaceLink space={props.space} title={<BaseAvatar {...props} />} />
  : <BaseAvatar {...props} />
