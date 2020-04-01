import React from 'react';

import { I18nProps } from '@polkadot/react-components/types';

import { ViewBlogPage } from './ViewBlog';
import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { NextPage } from 'next';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { HeadMeta } from '../utils/HeadMeta';
import { registry } from '@polkadot/react-api';
import BN from 'bn.js';
import { BlogData } from '@subsocial/types/dto';
import { SubsocialApi } from '@subsocial/api/fullApi';

type Props = I18nProps & {
  totalCount: number;
  blogsData: BlogData[];
};

export const ListBlog: NextPage<Props> = (props: Props) => {
  const { totalCount, blogsData } = props;
  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title='All blogs' desc='Subsocial blogs' />
      <ListData
        title={`All blogs (${totalCount})`}
        dataSource={blogsData}
        renderItem={(item, index) =>
          <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton />}
        noDataDesc='Blogs not created yet'
        noDataExt={<Button href='/blogs/new'>Create blog</Button>}
      />
    </div>
  );
};

ListBlog.getInitialProps = async (props): Promise<any> => {
  const subsocial = (props as any).subsocial as SubsocialApi
  const { substrate } = subsocial;
  const nextBlogId = await substrate.socialQuery().nextBlogId() as BlogId;

  const firstBlogId = new BN(1);
  const totalCount = nextBlogId.sub(firstBlogId).toNumber();
  let blogsData: BlogData[] = [];
  if (totalCount > 0) {
    const firstId = firstBlogId.toNumber();
    const lastId = nextBlogId.toNumber();
    const blogIds: BN[] = [];
    for (let i = firstId; i < lastId; i++) {
      blogIds.push(new BN(i));
    }
    blogsData = await subsocial.findBlogs(blogIds);
  }

  return {
    totalCount,
    blogsData
  };
};

type MyBlogProps = {
  blogsData: BlogData[];
};

export const ListMyBlogs: NextPage<MyBlogProps> = (props: MyBlogProps) => {
  const { blogsData } = props;
  const totalCount = blogsData.length;
  return (<>
    <HeadMeta title='My blogs' desc='Subsocial blogs' />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={`My Blogs (${totalCount})`}
        dataSource={blogsData}
        renderItem={(item, index) => <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton />}
        noDataDesc='You do not have your own blogs yet'
        noDataExt={<Button href='/blogs/new'>Create my first blog</Button>}
      />
    </div>
  </>
  );
};

ListMyBlogs.getInitialProps = async (props): Promise<any> => {
  const { query: { address } } = props;
  const subsocial = (props as any).subsocial as SubsocialApi
  const { substrate } = subsocial;
  const myBlogIds = await substrate.socialQuery().blogIdsByOwner(new AccountId(registry, address as string)) as unknown as BlogId[];
  const loadBlogs = await subsocial.findBlogs(myBlogIds);
  const blogsData = await Promise.all<BlogData>(loadBlogs);
  return {
    blogsData
  }
}
