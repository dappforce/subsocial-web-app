import React, { useState } from 'react'
import { PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { ShareAltOutlined } from '@ant-design/icons';
import { Button } from 'antd'
import { ShareModal } from './ShareModal'
import { isRegularPost } from './view-post';
import { IconWithLabel } from '../utils';

type Props = {
  postDetails: PostWithSomeDetails
  title?: React.ReactNode
  className?: string,
  preview?: boolean
}

export const SharePostAction = ({
  postDetails: {
    post: { struct: { id, shares_count, extension } },
    ext
  },
  preview,
  className = ''
}: Props) => {

  const [ open, setOpen ] = useState<boolean>()
  const postId = isRegularPost(extension as PostExtension) ? id : ext && ext.post.struct.id
  const title = 'Share'

  return <>
    <Button
      className={className}
      onClick={() => setOpen(true)}
      title={preview ? title : undefined}
      style={{ marginRight: !preview ? '-1rem' : '' }}
    >
      <IconWithLabel icon={<ShareAltOutlined />} count={shares_count} label={!preview ? title : undefined} />
    </Button>
    <ShareModal postId={postId} open={open} onClose={() => setOpen(false)} />
  </>
}

export default SharePostAction
