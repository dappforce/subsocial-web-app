import React from 'react';

import { I18nProps } from '@polkadot/ui-app/types';

import { ViewBlogPage, BlogData, loadBlogData } from './ViewBlog';
import { BlogId } from '../types';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { NextPage } from 'next';
import { AccountId } from '@polkadot/types';
import { HeadMeta } from '../utils/HeadMeta';
import { getApi } from '../utils/utils';

type Props = I18nProps & {
  totalCount: number,
  blogsData: BlogData[]
};

export const ListBlog: NextPage<Props> = (props: Props) => {
  const { totalCount, blogsData } = props;

  //console.log('blogs data: ', blogsData);

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
  const api = await getApi();
  const nextBlogId = await api.query.blogs.nextBlogId() as BlogId;

  const firstBlogId = new BlogId(1);
  const totalCount = nextBlogId.sub(firstBlogId).toNumber();
  let blogsData: BlogData[] = [];
  if (totalCount > 0) {
    const firstId = firstBlogId.toNumber();
    const lastId = nextBlogId.toNumber();
    const loadBlogs: Promise<BlogData>[] = [];
    for (let i = firstId; i < lastId; i++) {
      loadBlogs.push(loadBlogData(api, new BlogId(i)));
    }
    blogsData = await Promise.all<BlogData>(loadBlogs);
  }

  return {
    totalCount,
    blogsData
  };
};

type MyBlogProps = {
  blogsData: BlogData[]
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
  console.log(props);
  const api = await getApi();
  const myBlogIds = await api.query.blogs.blogIdsByOwner(new AccountId(address as string)) as unknown as BlogId[];
  const loadBlogs = myBlogIds.map(id => loadBlogData(api, id));
  const blogsData = await Promise.all<BlogData>(loadBlogs);
  console.log(blogsData);
  return {
    blogsData
  };
};
