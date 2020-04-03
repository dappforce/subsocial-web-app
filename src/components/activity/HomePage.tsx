import BN from 'bn.js';
import React from 'react';

import { ApiProps } from '@polkadot/react-api/types';
import { HeadMeta } from '../utils/HeadMeta';
import { ViewBlogPage, loadBlogData, BlogData } from '../blogs/ViewBlog';
import { BlogId, PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { ViewPostPage, loadPostDataList, PostDataListItem } from '../posts/ViewPost';
import { NextPage } from 'next';
import { getApi } from '../utils/SubstrateApi';

const ZERO = new BlogId(0);
const FIVE = new BlogId(5);

type Props = {
  blogsData: BlogData[],
  postsData: PostDataListItem[]
};

const LatestUpdate: NextPage<Props> = (props: Props) => {
  const { blogsData, postsData } = props;

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title='Subsocial latest updates' desc='Subsocial home page with latest updates' />
      <ListData
        title={`Latest blogs`}
        dataSource={blogsData}
        renderItem={(item, index) =>
          <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton />}
        noDataDesc='No latest updates yet'
        noDataExt={<Button href='/blogs/new'>Create blog</Button>}
      />
      {postsData.length > 0 && <ListData
        title={`Latest posts`}
        dataSource={postsData}
        renderItem={(item, index) =>
          <ViewPostPage key={index} variant='preview' postData={item.postData} postExtData={item.postExtData} />}
      />}
    </div>
  );
};

const getLastNIds = (nextId: BN, size: BN): BN[] => {
  const initIds = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
  const latestIds = new Array<BN>(initIds).fill(ZERO);

  return latestIds.map((_, index) => nextId.sub(new BN(index + 1)));
}

LatestUpdate.getInitialProps = async (): Promise<Props> => {
  const api = await getApi();
  const nextBlogId = await api.query.social.nextBlogId() as BlogId;
  const nextPostId = await api.query.social.nextPostId() as PostId;
  const getLastNIds = (nextId: BN, size: BN): BN[] => {
    const initIds = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
    const latestIds = new Array<BN>(initIds).fill(ZERO);

  const latestBlogIds = getLastNIds(nextBlogId, FIVE);
  const loadBlogs = latestBlogIds.map(id => loadBlogData(api, id as BlogId));
  const blogsData = await Promise.all<BlogData>(loadBlogs);

  const latestPostIds = getLastNIds(nextPostId, FIVE);
  const postsData = await loadPostDataList(api, latestPostIds as PostId[]);

  return {
    blogsData,
    postsData
  };
};

export default LatestUpdate;
