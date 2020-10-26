import React, { useState } from 'react'
import { PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { EditOutlined } from '@ant-design/icons';
import { ShareModal } from '../ShareModal'
import { isRegularPost } from '../view-post';
import { IconWithLabel } from '../../utils';
import { useAuth } from '../../auth/AuthContext';

type Props = {
  postDetails: PostWithSomeDetails
  title?: React.ReactNode
  preview?: boolean
}

export const SpaceShareLink = ({
  postDetails: {
    post: { struct: { id, extension } },
    ext
  }
}: Props) => {

  const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()
  const [ open, setOpen ] = useState<boolean>()
  const postId = isRegularPost(extension as PostExtension) ? id : ext && ext.post.struct.id
  const title = 'Write a post'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => isSignedIn ? setOpen(true) : openSignInModal('AuthRequired')}
      title={title}
    >
      <IconWithLabel icon={<EditOutlined />} label={title} />
    </a>
    <ShareModal postId={postId} open={open} onClose={() => setOpen(false)} />
  </>
}

export default SpaceShareLink
