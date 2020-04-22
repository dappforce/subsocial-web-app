import React from 'react';
import { ViewBlogPage } from './ViewBlog';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import BN from 'bn.js';
import { useRouter } from 'next/router';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { isMobile } from 'react-device-detect';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import Link from 'next/link';
import { BlogData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { nonEmptyArr, isEmptyArray } from '@subsocial/utils';

type ListBlogPageProps = {
  blogsData: BlogData[]
};

export const ListFollowingBlogsPage: NextPage<ListBlogPageProps> = (props: ListBlogPageProps) => {
  const { blogsData } = props;
  const totalCount = nonEmptyArr(blogsData) ? blogsData.length : 0;
  const title = `My Subscriptions (${totalCount})`

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <HeadMeta title={title} desc='The blogs you follow on Subsocial' />
      <ListData
        title={title}
        dataSource={blogsData}
        renderItem={(item, index) => (
          <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton/>
        )}
        noDataDesc='You are not subscribed to any blog yet'
        noDataExt={<Button href='/blogs/all'>Explore blogs</Button>}
      />
    </div>
  );
};

ListFollowingBlogsPage.getInitialProps = async (props): Promise<ListBlogPageProps> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;
  const followedBlogIds = await substrate.blogIdsFollowedByAccount(address as string)
  const blogsData = await subsocial.findBlogs(followedBlogIds);
  return {
    blogsData
  };
};

const BlogLink = (props: { item: BlogData }) => {
  const { item } = props;
  const router = useRouter();
  const { pathname, query } = router;
  const currentBlog = pathname.includes('blogs') ? new BN(query.blogId as string) : undefined;
  const { toggle } = useSidebarCollapsed();

  return <Link key={item.struct.id.toString()} href='/blogs/[blogId]' as={`/blogs/${item.struct.id}`}>
    <a className='DfMenuItem'>
      <div className={currentBlog && item.struct && currentBlog.eq(item.struct.id) ? 'DfSelectedBlog' : ''} >
        <ViewBlogPage
          key={item.struct.id.toString()}
          blogData={item}
          miniPreview
          imageSize={28}
          onClick={() => isMobile && toggle()}
        />
      </div>
    </a>
  </Link>
}

export const RenderFollowedList = (props: { followedBlogsData: BlogData[] }) => {
  const { followedBlogsData } = props;

  if (isEmptyArray(followedBlogsData)) {
    return (
      <div className='text-center m-2'>
        <Button type='primary' href='/blogs/all'>Explore Blogs</Button>
      </div>
    )
  }

  return <>{followedBlogsData.map((item) =>
    <BlogLink key={item.struct.id.toString()} item={item} />
  )}</>
}

export default RenderFollowedList;
