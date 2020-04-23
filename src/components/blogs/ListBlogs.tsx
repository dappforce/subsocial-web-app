import React from 'react';
import { ViewBlogPage } from './ViewBlog';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import BN from 'bn.js';
import { BlogData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';

type Props = {
  totalCount: number;
  blogsData: BlogData[];
};

export const ListAllBlogs: NextPage<Props> = (props: Props) => {
  const { totalCount, blogsData } = props;
  const title = `Explore Blogs (${totalCount})`

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title={title} desc='Find interesting blogs on Subsocial and follow them.' />
      <ListData
        title={title}
        dataSource={blogsData}
        renderItem={(item, index) =>
          <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton />}
        noDataDesc='There are no blogs yet'
        noDataExt={<Button href='/blogs/new'>Create blog</Button>}
      />
    </div>
  );
};

ListAllBlogs.getInitialProps = async (props): Promise<any> => {
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const nextBlogId = await substrate.nextBlogId()

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

ListMyBlogs.getInitialProps = async (props): Promise<MyBlogProps> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const myBlogIds = await substrate.blogIdsByOwner(address as string)
  const blogsData = await subsocial.findBlogs(myBlogIds);
  return {
    blogsData
  }
}
