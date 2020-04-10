import React from 'react';
import { NextPage } from 'next';
import BN from 'bn.js';

import { BlogId, PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { getApi } from '../utils/SubstrateApi';
import { HeadMeta } from '../utils/HeadMeta';
import { BlogData, loadBlogData } from '../blogs/ViewBlog';
import { loadPostDataList, PostDataListItem } from '../posts/ViewPost';
import { LatestBlogs } from './LatestBlogs';
import { LatestPosts } from './LatestPosts';

const ZERO = new BN(0);
const FIVE = new BN(5);

type Props = {
  blogsData: BlogData[]
  postsData: PostDataListItem[]
}

const LatestUpdate: NextPage<Props> = (props: Props) => {
  const { blogsData, postsData } = props;

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta
        title='Subsocial latest updates'
        desc='Subsocial home page with latest updates'
      />
      <LatestBlogs {...props} blogsData={blogsData} />
      <LatestPosts {...props} postsData={postsData} />
      {/* TODO Show latest comments */}
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
  const api = await getApi();
  const nextBlogId = await api.query.social.nextBlogId() as BlogId;
  const nextPostId = await api.query.social.nextPostId() as PostId;

  const latestBlogIds = getLastNIds(nextBlogId, FIVE);
  const loadBlogs = latestBlogIds.map(id => loadBlogData(api, id as BlogId));
  const blogsData = await Promise.all<BlogData>(loadBlogs);

  const latestPostIds = getLastNIds(nextPostId, FIVE);
  const postsData = await loadPostDataList(api, latestPostIds as PostId[]);
  console.log('Loaded posts on the home page:', postsData)

  return {
    blogsData,
    postsData
  }
}

export default LatestUpdate;
