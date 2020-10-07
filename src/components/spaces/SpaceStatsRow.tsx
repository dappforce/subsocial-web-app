import { Space } from '@subsocial/types/substrate/interfaces';
import BN from 'bn.js';
import Link from 'next/link';
import React, { useState } from 'react';

import { SpaceFollowersModal } from '../profiles/AccountsListModal';
import { ZERO } from '../utils';
import { MutedSpan } from '../utils/MutedText';
import { Pluralize } from '../utils/Plularize';
import { spaceUrl } from '../urls';
import AboutSpaceLink from './AboutSpaceLink';
import { isMySpace } from './helpers';

type Props = {
  space: Space
}

export const SpaceStatsRow = ({ space }: Props) => {
  const {
    id,
    score,
    posts_count,
    followers_count: followers
  } = space;

  const [ followersOpen, setFollowersOpen ] = useState(false);

  const postsCount = new BN(posts_count).eq(ZERO) ? 0 : new BN(posts_count);
  const followersClassName = 'DfStatItem DfGreyLink ' + (!followers && 'disable')

  return (
    <div className={`${isMySpace(space) && 'MySpace DfStatItem'}`}>
      <Link href='/[spaceId]' as={spaceUrl(space)}>
        <a className={'DfStatItem ' + (!postsCount && 'disable')}>
          <Pluralize count={postsCount} singularText='Post'/>
        </a>
      </Link>

      <div onClick={() => setFollowersOpen(true)} className={followersClassName}>
        <Pluralize count={followers} singularText='Follower'/>
      </div>

      <MutedSpan><AboutSpaceLink className='DfGreyLink DfStatItem' space={space} title='About' /></MutedSpan>

      <MutedSpan className='DfStatItem'>
        <Pluralize count={score} singularText='Point' />
      </MutedSpan>

      {followersOpen &&
        <SpaceFollowersModal
          id={id}
          title={<Pluralize count={followers} singularText='Follower'/>}
          accountsCount={space.followers_count}
          open={followersOpen}
          close={() => setFollowersOpen(false)}
        />
      }
    </div>
  )
}

export default SpaceStatsRow
