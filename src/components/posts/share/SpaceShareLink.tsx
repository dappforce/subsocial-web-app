import React, { useState } from 'react'
import { PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { BookOutlined } from '@ant-design/icons';
import { ShareModal } from '../ShareModal'
import { isRegularPost } from '../view-post';
import { IconWithLabel } from '../../utils';

type Props = {
  postDetails: PostWithSomeDetails
  title?: React.ReactNode
  preview?: boolean
}

export const SpaceShareLink = ({
  postDetails: {
    post: { struct: { id, shares_count, extension } },
    ext
  }
}: Props) => {

  const [ open, setOpen ] = useState<boolean>()
  const postId = isRegularPost(extension as PostExtension) ? id : ext && ext.post.struct.id
  const title = 'My space'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => setOpen(true)}
      title={title}
    >
      <IconWithLabel icon={<BookOutlined />} count={shares_count} label={title} />
    </a>
    <ShareModal postId={postId} open={open} onClose={() => setOpen(false)} />
  </>
}

export default SpaceShareLink
