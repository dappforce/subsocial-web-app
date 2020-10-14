import React, { useState } from 'react'
import { Post } from '@subsocial/types/substrate/interfaces'
import { MoveModal } from 'src/components/posts/modals/MoveModal'

type Props = {
  post: Post
}

export const MovePostLink = ({ post }: Props) => {

  const [ open, setOpen ] = useState<boolean>()
  const title = 'Move post'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => setOpen(true)}
      title={title}
    >
      {title}
    </a>
    <MoveModal post={post} open={open} onClose={() => setOpen(false)} />
  </>
}

export default MovePostLink
