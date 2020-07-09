import React, { useState } from 'react'
import { PostWithSomeDetails } from '@subsocial/types/dto';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { Button } from 'antd'
import { ShareModal } from './ShareModal'
import { isRegularPost } from './view-post';
import { IconWithLabel } from '../utils';

type Props = {
  postStruct: PostWithSomeDetails
  title?: React.ReactNode
  className?: string,
  preview?: boolean
}

export const SharePostAction = ({
  postStruct: {
    post: { struct: { id, shares_count, extension } },
    ext
  },
  preview,
  className = ''
}: Props) => {

  const [ open, setOpen ] = useState<boolean>()

  return <>
    <span className={className} onClick={() => setOpen(true)}>
      {withIcon && <><Icon type='share-alt' /> {' '}</>}
      {title}
    </span>
    <ShareModal postId={postId} open={open} onClose={() => setOpen(false)} />
  </>
}

export default SharePostAction
