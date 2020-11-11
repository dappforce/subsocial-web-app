import React, { useState } from 'react'
import { PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { EditOutlined } from '@ant-design/icons';
import { ShareModal } from 'src/components/posts/modals/ShareModal'
import { isRegularPost } from 'src/components/posts/view-post';
import { IconWithLabel } from 'src/components/utils';
import { useAuth } from 'src/components/auth/AuthContext';

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

  const { openSignInModal, state: { isSteps: { isSignIn } } } = useAuth()
  const [ open, setOpen ] = useState<boolean>()
  const postId = isRegularPost(extension as PostExtension) ? id : ext && ext.post.struct.id
  const title = 'Write a post'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => isSignIn ? setOpen(true) : openSignInModal('AuthRequired')}
      title={title}
    >
      <IconWithLabel icon={<EditOutlined />} label={title} />
    </a>
    <ShareModal postId={postId} open={open} onClose={() => setOpen(false)} />
  </>
}

export default SpaceShareLink
