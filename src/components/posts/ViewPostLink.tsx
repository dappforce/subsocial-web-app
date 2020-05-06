import React from 'react'
import Link from 'next/link'
import { HasBlogIdOrHandle, HasPostId, postUrl } from '../utils/urls'

type Props = React.PropsWithChildren<{
  blog: HasBlogIdOrHandle
  post: HasPostId
  title?: string
  hint?: string
  className?: string
}>

export const ViewPostLink = ({
  blog,
  post,
  title,
  hint,
  className,
  children
}: Props) => {

  const linkTitle = title || children

  if (!blog.id || !post.id || !linkTitle) return null

  return (
    <Link href='/blogs/[blogId]/posts/[postId]' as={postUrl(blog, post)}>
      <a className={className} title={hint}>{linkTitle}</a>
    </Link>
  )
}

export default ViewPostLink
