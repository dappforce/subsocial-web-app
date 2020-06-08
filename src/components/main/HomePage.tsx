import React from 'react';
import { NextPage } from 'next';
import BN from 'bn.js';

import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { HeadMeta } from '../utils/HeadMeta';
import { LatestSpaces } from './LatestSpaces';
import { LatestPosts } from './LatestPosts';
import { SpaceData, PostWithAllDetails } from '@subsocial/types';
import { PageContent } from './PageWrapper';

const ZERO = new BN(0);
const FIVE = new BN(5);

type Props = {
  spacesData: SpaceData[]
  postsData: PostWithAllDetails[]
}

const LatestUpdate: NextPage<Props> = (props: Props) => {
  const { spacesData, postsData } = props;

  return (
    <PageContent withOnBoarding>
      <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
        <HeadMeta
          title='Latest posts and spaces'
          desc='Subsocial is an open decentralized social network'
        />
        <LatestPosts {...props} postsData={postsData} />
        <LatestSpaces {...props} spacesData={spacesData} />
      </div>
    </PageContent>

  );
}

const getLastNIds = (nextId: BN, size: BN): BN[] => {
  const idsCount = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
  return new Array<BN>(idsCount)
    .fill(ZERO)
    .map((_, index) =>
      nextId.sub(new BN(index + 1)))
}

LatestUpdate.getInitialProps = async (): Promise<Props> => {
  const subsocial = await getSubsocialApi();
  const { substrate } = subsocial
  const nextSpaceId = await substrate.nextSpaceId()
  const nextPostId = await substrate.nextPostId()

  const latestSpaceIds = getLastNIds(nextSpaceId, FIVE);
  const spacesData = await subsocial.findSpaces(latestSpaceIds)

  const latestPostIds = getLastNIds(nextPostId, FIVE);
  const postsData = await subsocial.findPostsWithAllDetails(latestPostIds as PostId[]);

  return {
    spacesData,
    postsData
  }
}

export default LatestUpdate;
