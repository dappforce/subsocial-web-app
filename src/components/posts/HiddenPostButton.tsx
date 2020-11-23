import React from 'react'
import { Post } from '@subsocial/types/substrate/interfaces'
import HiddenButton from '../utils/HiddenButton'
import { PostUpdate, OptionId, OptionBool, OptionIpfsContent } from '@subsocial/types/substrate/classes'
import { isComment } from './view-post'

type HiddenPostButtonProps = {
  post: Post,
  asLink?: boolean
};

export function HiddenPostButton (props: HiddenPostButtonProps) {
  const { post } = props
  const hidden = post.hidden.valueOf()

  const newTxParams = () => {
    const update = new PostUpdate(
      {
      // If we provide a new space_id in update, it will move this post to another space.
        space_id: new OptionId(),
        content: new OptionIpfsContent(),
        hidden: new OptionBool(!hidden) // TODO has no implementation on UI
      })
    return [ post.id, update ]
  }

  return <HiddenButton type={isComment(post.extension) ? 'comment' : 'post'} newTxParams={newTxParams} struct={post} {...props} />
}

export default HiddenPostButton
