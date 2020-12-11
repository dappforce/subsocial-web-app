import Link from 'next/link'
import React, { useState } from 'react'

import { SpaceFollowersModal } from '../profiles/AccountsListModal'
import { MutedSpan } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import { spaceUrl } from '../urls'
import AboutSpaceLink from './AboutSpaceLink'
import { isMySpace } from './helpers'
import { useResponsiveSize } from '../responsive'
import { SpaceStruct } from 'src/types'

type Props = {
  space: SpaceStruct
}

export const SpaceStatsRow = ({ space }: Props) => {
  const {
    id,
    score,
    postsCount,
    followersCount
  } = space

  const { isMobile } = useResponsiveSize()
  const [ followersOpen, setFollowersOpen ] = useState(false)
  const statLinkCss = 'DfStatItem'

  return (
    <div className={`${isMySpace(space) && 'MySpace DfStatItem'}`}>
      <Link href='/[spaceId]' as={spaceUrl(space)}>
        <a className={statLinkCss}>
          <Pluralize count={postsCount} singularText='Post'/>
        </a>
      </Link>

      <div onClick={() => setFollowersOpen(true)} className={statLinkCss} style={{ cursor: 'pointer' }}>
        <Pluralize count={followersCount} singularText='Follower' />
      </div>

      {!isMobile && <>
        <MutedSpan>
          <AboutSpaceLink className={statLinkCss} space={space} title='About' />
        </MutedSpan>

        <MutedSpan className='DfStatItem'>
          <Pluralize count={score} singularText='Point' />
        </MutedSpan>
      </>}

      {followersOpen &&
        <SpaceFollowersModal
          id={id}
          title={<Pluralize count={followersCount} singularText='Follower' />}
          open={followersOpen}
          close={() => setFollowersOpen(false)}
        />
      }
    </div>
  )
}

export default SpaceStatsRow
