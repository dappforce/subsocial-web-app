import React from 'react'
import Link from 'next/link'
import { HasSpaceIdOrHandle, spaceUrl } from '../utils/urls'

type Props = {
  space: HasSpaceIdOrHandle
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewSpaceLink = ({
  space,
  title,
  hint,
  className
}: Props) => {

  if (!space.id || !title) return null

  return (
    <Link href='/spaces/[spaceId]' as={spaceUrl(space)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default ViewSpaceLink
