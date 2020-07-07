import React, { useState } from 'react'
import { PostId } from '@subsocial/types/substrate/interfaces'
import { Icon } from 'antd'
import { ShareModal } from './ShareModal'

type Props = {
  postId?: PostId
  title?: React.ReactNode
  className?: string,
  withIcon?: boolean
}

export const SharePostAction = ({
  postId,
  title = 'Share',
  className = '',
  withIcon = true
}: Props) => {

  const [ open, setOpen ] = useState<boolean>()

  return (
    <>
      <span className={className} onClick={() => setOpen(true)}>
        {withIcon && <><Icon type='share-alt' /> {' '}</>}
        {title}
      </span>
      <ShareModal postId={postId} open={open} close={() => setOpen(false)} />
    </>
  )
}

export default SharePostAction
