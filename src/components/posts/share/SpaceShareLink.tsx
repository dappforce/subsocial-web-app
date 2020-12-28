import React, { useState } from 'react'
import { idToBn, PostWithSomeDetails } from 'src/types'
import { EditOutlined } from '@ant-design/icons'
import { SharePostModal } from '../ShareModal'
import { IconWithLabel } from '../../utils'
import { useAuth } from '../../auth/AuthContext'

type Props = {
  postDetails: PostWithSomeDetails
  title?: React.ReactNode
  preview?: boolean
}

export const SpaceShareLink = ({
  postDetails: {
    post: { struct: { id, isRegularPost } },
    ext
  }
}: Props) => {

  const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()
  const [ open, setOpen ] = useState<boolean>()
  const postId = isRegularPost ? id : ext && ext.post.struct.id
  const title = 'Write a post'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => isSignedIn ? setOpen(true) : openSignInModal('AuthRequired')}
      title={title}
    >
      <IconWithLabel icon={<EditOutlined />} label={title} />
    </a>
    {postId && <SharePostModal postId={idToBn(postId)} open={open} onClose={() => setOpen(false)} />}
  </>
}

export default SpaceShareLink
