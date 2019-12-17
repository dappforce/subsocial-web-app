import React from 'react';

import { I18nProps } from '@polkadot/ui-app/types';

import { ViewBlog } from './ViewBlog';
import { BlogId } from '../types';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { NextPage } from 'next';
import Api from '../utils/SubstrateApi';
import { api as webApi } from '@polkadot/ui-api';
import { AccountId } from '@polkadot/types';
import { Loading } from '../utils/utils';
import { SeoHeads } from '../utils';

type Props = I18nProps & {
  totalCount: number,
  ids: BlogId[]
};

export const ListBlog: NextPage<Props> = (props: Props) => {
  const { totalCount, ids } = props;
  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={`All blogs (${totalCount})`}
        dataSource={ids}
        renderItem={(item, index) =>
          <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton />}
        noDataDesc='Blogs not created yet'
        noDataExt={<Button href='/blog/new'>Create blog</Button>}
      />
    </div>
  );
};

ListBlog.getInitialProps = async (props): Promise<any> => {
  const api = props.req ? await Api.setup() : webApi;
  const nextBlogId = await api.query.blogs.nextBlogId() as BlogId;

  const firstBlogId = new BlogId(1);
  const totalCount = nextBlogId.sub(firstBlogId).toNumber();
  const ids: BlogId[] = [];
  if (totalCount > 0) {
    const firstId = firstBlogId.toNumber();
    const lastId = nextBlogId.toNumber();
    for (let i = firstId; i < lastId; i++) {
      ids.push(new BlogId(i));
    }
  }

  return {
    totalCount,
    ids
  };
};

type MyBlogProps = {
  myBlogIds?: BlogId[]
};

export const ListMyBlogs: NextPage<MyBlogProps> = (props: MyBlogProps) => {
  const { myBlogIds } = props;
  if (!myBlogIds) return <Loading />;

  const totalCount = myBlogIds.length;
  return (<>
    <SeoHeads title='My blogs' desc='Subsocial blogs' />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={`My Blogs (${totalCount})`}
        dataSource={myBlogIds}
        renderItem={(item, index) => <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton />}
        noDataDesc='You do not have your own blogs yet'
        noDataExt={<Button href='/blog/new'>Create my first blog</Button>}
      />
    </div>
  </>
  );
};

ListMyBlogs.getInitialProps = async (props): Promise<any> => {
  const { query: { address }, req } = props;
  console.log(props);
  const api = req ? await Api.setup() : webApi;
  const myBlogIds = await api.query.blogs.blogIdsByOwner(new AccountId(address as string));
  console.log(myBlogIds);
  return {
    myBlogIds
  };
};
