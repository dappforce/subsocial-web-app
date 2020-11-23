import { Post, Space } from '@subsocial/types/substrate/interfaces'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import HiddenPostButton from 'src/components/posts/HiddenPostButton'
import HiddenSpaceButton from 'src/components/spaces/HiddenSpaceButton'
import { EntityStatusPanel, EntityStatusProps } from './EntityStatusPanel'

type Props = EntityStatusProps & {
  type: 'space' | 'post' | 'comment'
  struct: Space | Post
}

export const HiddenEntityPanel = ({
  type,
  struct,
  ...otherProps
}: Props) => {

  // If entity is not hidden or it's not my entity
  if (!struct.hidden.valueOf() || !isMyAddress(struct.owner)) return null

  const HiddenButton = () => type === 'space'
    ? <HiddenSpaceButton space={struct as Space} />
    : <HiddenPostButton post={struct as Post} />

  return <EntityStatusPanel
    desc={`This ${type} is unlisted and only you can see it`}
    actions={[ <HiddenButton key='hidden-button' /> ]}
    {...otherProps}
  />
}

export default HiddenEntityPanel
