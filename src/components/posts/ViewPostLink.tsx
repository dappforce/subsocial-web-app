import React from 'react'
import Link from 'next/link'
import { HasSpaceIdOrHandle, HasPostId, postUrl } from '../urls'

type Props = {
  space: HasSpaceIdOrHandle
  post: HasPostId
  title?: string
  hint?: string
  className?: string
}

export const ViewPostLink = ({
  space,
  post,
  title,
  hint,
  className
}: Props) => {

  if (!space.id || !post.id || !title) return null

  return (
    <Link href='/[spaceId]/posts/[postId]' as={postUrl(space, post)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default ViewPostLink
