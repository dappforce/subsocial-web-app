import React from 'react';
import { NextPage } from 'next';
import BN from 'bn.js';

import { getSubsocialApi } from '../utils/SubsocialConnect';
import { HeadMeta } from '../utils/HeadMeta';
import { LatestSpaces } from './LatestSpaces';
import { LatestPosts } from './LatestPosts';
import { SpaceData, PostWithAllDetails } from '@subsocial/types';
import { PageContent } from './PageWrapper';
import partition from 'lodash.partition';
import { isComment } from '../posts/view-post';
import { ZERO } from '../utils';
import { useIsSignIn } from '../auth/MyAccountContext';
import { MyFeed } from '../activity/MyFeed';

const RESERVED_SPACES = new BN(1000 + 1)
const FIFTY = new BN(50);
const MAX_TO_SHOW = 5;

type Props = {
  spacesData: SpaceData[]
  postsData: PostWithAllDetails[],
  commentData: PostWithAllDetails[]
}

const LatestUpdate = (props: Props) => {
  const { spacesData, postsData, commentData } = props;

  return (
    <PageContent>
      <HeadMeta
        title='Latest posts and spaces'
        desc='Subsocial is an open decentralized social network'
      />
      <LatestPosts {...props} postsData={postsData} type='post' />
      <LatestPosts {...props} postsData={commentData} type='comment' />
      <LatestSpaces {...props} spacesData={spacesData} />
    </PageContent>

  );
}

const HomePage: NextPage<Props> = (props) => useIsSignIn() ? <MyFeed /> : <LatestUpdate {...props}/>

const getLastNIds = (nextId: BN, size: BN): BN[] => {
  const idsCount = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
  return new Array<BN>(idsCount)
    .fill(ZERO)
    .map((_, index) =>
      nextId.sub(new BN(index + 1)))
}

HomePage.getInitialProps = async (): Promise<Props> => {
  const subsocial = await getSubsocialApi();
  const { substrate } = subsocial
  const nextSpaceId = await substrate.nextSpaceId()
  const nextPostId = await substrate.nextPostId()

  const newSpaces = nextSpaceId.sub(RESERVED_SPACES)
  const spaceLimit = newSpaces.lt(FIFTY) ? newSpaces : FIFTY

  const latestSpaceIds = getLastNIds(nextSpaceId, spaceLimit);
  const visibleSpacesData = await subsocial.findPublicSpaces(latestSpaceIds) as SpaceData[]
  const spacesData = visibleSpacesData.slice(0, MAX_TO_SHOW)

  const latestPostIds = getLastNIds(nextPostId, FIFTY);
  const allPostsData = await subsocial.findPublicPostsWithAllDetails(latestPostIds);
  const [ visibleCommentData, visiblePostsData ] = partition(allPostsData, (x) => isComment(x.post.struct.extension))

  const postsData = visiblePostsData.slice(0, MAX_TO_SHOW)
  const commentData = visibleCommentData.slice(0, MAX_TO_SHOW)

  return {
    spacesData,
    postsData,
    commentData
  }
}

export default HomePage;
