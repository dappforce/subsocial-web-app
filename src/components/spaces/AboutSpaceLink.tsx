import React from 'react'
import Link from 'next/link'
import { HasSpaceIdOrHandle, aboutSpaceUrl } from '../urls'

type Props = {
  space: HasSpaceIdOrHandle
  title?: string
  hint?: string
  className?: string
}

export const AboutSpaceLink = ({
  space,
  title,
  hint,
  className
}: Props) => {

  if (!space.id || !title) return null

  return (
    <Link href='/spaces/[spaceId]/about' as={aboutSpaceUrl(space)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default AboutSpaceLink
