import React from 'react'
import Link from 'next/link'
import { spaceUrl } from '../urls'
import { SpaceStruct } from 'src/types'

type Props = {
  space: SpaceStruct
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewSpaceLink = React.memo(({
  space,
  title,
  hint,
  className
}: Props) => {

  if (!space.id || !title) return null

  return <span>
    <Link href='/[spaceId]' as={spaceUrl(space)}>
      <a className={'DfBlackLink ' + className} title={hint}>{title}</a>
    </Link>
  </span>
})

export default ViewSpaceLink
