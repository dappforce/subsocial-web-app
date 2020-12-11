import React from 'react'
import Link from 'next/link'
import { aboutSpaceUrl } from '../urls'
import { SpaceStruct } from 'src/types'

type Props = {
  space: SpaceStruct
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
    <Link href='/[spaceId]/about' as={aboutSpaceUrl(space)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default AboutSpaceLink
