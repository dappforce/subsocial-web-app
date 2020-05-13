import React from 'react'
import Link from 'next/link'
import { HasBlogIdOrHandle, HasPostId, postUrl } from '../utils/urls'

type Props = {
  blog: HasBlogIdOrHandle
  post: HasPostId
  title?: string
  hint?: string
  className?: string
}

export const ViewPostLink = ({
  blog,
  post,
  title,
  hint,
  className
}: Props) => {

  if (!blog.id || !post.id || !title) return null

  return (
    <Link href='/blogs/[blogId]/posts/[postId]' as={postUrl(blog, post)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default ViewPostLink
