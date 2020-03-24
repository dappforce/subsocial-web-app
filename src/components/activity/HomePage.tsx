import BN from 'bn.js';
import React from 'react';

import { ApiProps } from '@polkadot/react-api/types';
import { HeadMeta } from '../utils/HeadMeta';
import { ViewBlogPage } from '../blogs/ViewBlog';
import { BlogId, PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { ViewPostPage, loadPostDataList, PostDataListItem } from '../posts/ViewPost';
import { NextPage } from 'next';
import { BlogData } from '@subsocial/types/dto';
import { SubsocialApi } from '@subsocial/api/fullApi';

const FIVE = new BN(5);
const ZERO = new BN(0);
type Props = ApiProps & {
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

LatestUpdate.getInitialProps = async (props): Promise<any> => {
  const subsocial = (props as any).subsocial as SubsocialApi
  console.log('Subsocial', subsocial)
  const nextBlogId = await subsocial.substrate.socialQuery().nextBlogId() as BlogId;
  const nextPostId = await subsocial.substrate.socialQuery().nextPostId() as PostId;
  console.log('NextPostId', nextBlogId);
  const blog = await subsocial.substrate.findBlog(new BN(1));
  console.log('BLOG:', blog);
  const content = blog && await subsocial.ipfs.findBlog(blog.ipfs_hash.toString());
  console.log('BLOG:', blog, content);
  const getLastNIds = (nextId: BN, size: BN): BN[] => {
    const initIds = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
    const latestIds = new Array<BN>(initIds).fill(ZERO);

    return latestIds.map((_, index) => nextId.sub(new BN(index + 1)));
  };

  const latestBlogIds = getLastNIds(nextBlogId, FIVE);
  const blogsData = await subsocial.findBlogs(latestBlogIds);
  const latestPostIds = getLastNIds(nextPostId, FIVE);
  const postsData = await loadPostDataList(latestPostIds as PostId[]);

  return {
    blogsData,
    postsData
  };
};

export default LatestUpdate;
