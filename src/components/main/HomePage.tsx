import React from 'react';
import { NextPage } from 'next';
import BN from 'bn.js';

import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { HeadMeta } from '../utils/HeadMeta';
import { LatestBlogs } from './LatestBlogs';
import { LatestPosts } from './LatestPosts';
import { BlogData, PostWithAllDetails } from '@subsocial/types';

const ZERO = new BN(0);
const FIVE = new BN(5);

type Props = {
  blogsData: BlogData[]
  postsData: PostWithAllDetails[]
}

const LatestUpdate: NextPage<Props> = (props: Props) => {
  const { blogsData, postsData } = props;

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta
        title='Latest posts and blogs'
        desc='Subsocial is an open decentralized social network'
      />
      <LatestPosts {...props} postsData={postsData} />
      {/* TODO Show latest comments */}
      <LatestBlogs {...props} blogsData={blogsData} />
    </div>
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
  const nextBlogId = await substrate.nextBlogId()
  const nextPostId = await substrate.nextPostId()

  const latestBlogIds = getLastNIds(nextBlogId, FIVE);
  const blogsData = await subsocial.findBlogs(latestBlogIds)

  const latestPostIds = getLastNIds(nextPostId, FIVE);
  const postsData = await subsocial.findPostsWithAllDetails(latestPostIds as PostId[]);

  console.log('>>>>>>>>>>>>>>>>>>>>>', postsData)
  return {
    blogsData,
    postsData
  }
}

export default LatestUpdate;
