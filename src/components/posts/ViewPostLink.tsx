import React from 'react'
import Link from 'next/link'
import { HasSpaceIdOrHandle, HasDataForSlug, postUrl } from '../urls'

type Props = {
  space: HasSpaceIdOrHandle
  post: HasDataForSlug
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

  if (!space.id || !post.struct.id || !title) return null

  return (
    <Link href='/[spaceId]/[slug]' as={postUrl(space, post)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default ViewPostLink
