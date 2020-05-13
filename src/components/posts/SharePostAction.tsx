import React, { useState } from 'react'
import { PostId } from '@subsocial/types/substrate/interfaces'
import { Icon } from 'antd'
import { ShareModal } from './ShareModal'

type Props = {
  postId?: PostId
  title?: React.ReactNode
  className?: string
}

export const SharePostAction = ({
  postId,
  title = 'Share',
  className = ''
}: Props) => {

  const [ open, setOpen ] = useState(false)
  const close = () => setOpen(false)

  return (
    <span className={className} onClick={() => setOpen(true)}>
      <Icon type='share-alt' />{' '}{title}
      {open && <ShareModal postId={postId} open={open} close={close} />}
    </span>
  )
}

export default SharePostAction
