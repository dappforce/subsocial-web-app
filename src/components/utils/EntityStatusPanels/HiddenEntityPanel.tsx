import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import HiddenPostButton from 'src/components/posts/HiddenPostButton'
import HiddenSpaceButton from 'src/components/spaces/HiddenSpaceButton'
import { PostStruct, SpaceStruct } from 'src/types'
import { EntityStatusPanel, EntityStatusProps } from './EntityStatusPanel'

type Props = EntityStatusProps & {
  type: 'space' | 'post' | 'comment'
  struct: SpaceStruct | PostStruct
}

export const HiddenEntityPanel = ({
  type,
  struct,
  ...otherProps
}: Props) => {

  // If entity is not hidden or it's not my entity
  if (!struct.hidden || !isMyAddress(struct.ownerId)) return null

  const HiddenButton = () => type === 'space'
    ? <HiddenSpaceButton space={struct as SpaceStruct} />
    : <HiddenPostButton post={struct as PostStruct} />

  return <EntityStatusPanel
    desc={`This ${type} is unlisted and only you can see it`}
    actions={[ <HiddenButton key='hidden-button' /> ]}
    {...otherProps}
  />
}

export default HiddenEntityPanel
