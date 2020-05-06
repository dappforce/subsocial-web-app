import React from 'react'
import Link from 'next/link'
import { HasBlogIdOrHandle, aboutBlogUrl } from '../utils/urls'

type Props = {
  blog: HasBlogIdOrHandle
  title?: string
  hint?: string
  className?: string
}

export const AboutBlogLink = ({
  blog,
  title,
  hint,
  className
}: Props) => {

  if (!blog.id || !title) return null

  return (
    <Link href='/blogs/[blogId]/about' as={aboutBlogUrl(blog)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default AboutBlogLink
