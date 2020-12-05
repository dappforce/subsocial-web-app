import React from 'react'
import Link from 'next/link'
import { HasDataForSlug, postUrl } from '../urls'
import { SpaceStruct } from 'src/types'

type Props = {
  space: SpaceStruct
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
