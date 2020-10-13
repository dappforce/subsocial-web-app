import React, { useState } from 'react'
import { PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { MoveModal } from 'src/components/posts/MoveModal'
import { isRegularPost } from 'src/components/posts/view-post';

type Props = {
  postDetails: PostWithSomeDetails
  title?: React.ReactNode
  preview?: boolean
}

export const MovePostLink = ({
  postDetails: {
    post: { struct: { id, extension } },
    ext
  }
}: Props) => {

  const [ open, setOpen ] = useState<boolean>()
  const postId = isRegularPost(extension as PostExtension) ? id : undefined
  const title = 'Move post'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => setOpen(true)}
      title={title}
    >
      {title}
    </a>
    <MoveModal postId={postId} open={open} onClose={() => setOpen(false)} />
  </>
}

export default MovePostLink
