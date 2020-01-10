import BN from 'bn.js';
import React from 'react';

import { ApiProps } from '@polkadot/ui-api/types';
import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';
import { SeoHeads } from '../utils/index';
import { ViewBlogPage, loadBlogData, BlogData } from '../blogs/ViewBlog';
import { BlogId, PostId } from '../types';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { ViewPostPage, loadPostDataList, PostDataListItem } from '../posts/ViewPost';
import { NextPage } from 'next';
import Api from '../utils/SubstrateApi';
import { api as webApi } from '@polkadot/ui-api';

const FIVE = new BlogId(5);
const ZERO = new BlogId(0);
type Props = ApiProps & {
  blogsData: BlogData[],
  postsData: PostDataListItem[]
};

const LatestUpdate: NextPage<Props> = (props: Props) => {

  const { blogsData, postsData } = props;

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <SeoHeads title='Subsocial latest updates' name='Home' desc='Subsocial home page with latestt updates' image={substrateLogo} />
      <ListData
        title={`Latest blogs`}
        dataSource={blogsData}
        renderItem={(item, index) =>
          <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton />}
        noDataDesc='No latest updates yet'
        noDataExt={<Button href='/blog/new'>Create blog</Button>}
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
  const api = props.req ? await Api.setup() : webApi;
  const nextBlogId = await api.query.blogs.nextBlogId() as BlogId;
  const nextPostId = await api.query.blogs.nextPostId() as PostId;
  const getLastNIds = (nextId: BN, size: BN): BN[] => {
    const initIds = nextId.lte(size) ? nextId.toNumber() - 1 : size.toNumber();
    let latestIds = new Array<BN>(initIds).fill(ZERO);

    return latestIds.map((_,index) => nextId.sub(new BN(index + 1)));
  };

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
