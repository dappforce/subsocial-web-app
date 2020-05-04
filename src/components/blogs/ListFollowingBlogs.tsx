import React from 'react';
import { ViewBlogPage } from './ViewBlog';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { isMobile } from 'react-device-detect';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import Link from 'next/link';
import { BlogData } from '@subsocial/types/dto';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { nonEmptyArr, isEmptyArray } from '@subsocial/utils';
import { blogUrl, blogIdForUrl } from '../utils/urls';

type Props = {
  blogsData: BlogData[]
};

export const ListFollowingBlogsPage: NextPage<Props> = (props) => {
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

ListFollowingBlogsPage.getInitialProps = async (props): Promise<Props> => {
  const { query: { address } } = props;
  const subsocial = await getSubsocialApi()
  const { substrate } = subsocial;

  // TODO sort blog ids in a desc order (don't forget to sort by id.toString())
  const followedBlogIds = await substrate.blogIdsFollowedByAccount(address as string)
  const blogsData = await subsocial.findBlogs(followedBlogIds);

  return {
    blogsData
  };
};

// TODO extract to a separate file:
const BlogLink = (props: { item: BlogData }) => {
  const { item } = props;
  const { pathname, query } = useRouter();
  const { toggle } = useSidebarCollapsed();

  if (!item) return null;

  const idForUrl = blogIdForUrl(item.struct)
  const isSelectedBlog = pathname.includes('blogs') &&
    query.blogId as string === idForUrl

  return (
    <Link
      key={idForUrl}
      href='/blogs/[blogId]'
      as={blogUrl(item.struct)}
    >
      <a className={`DfMenuBlogLink ${isSelectedBlog ? 'DfSelectedBlog' : ''}`}>
        <ViewBlogPage
          key={idForUrl}
          blogData={item}
          miniPreview
          imageSize={28}
          onClick={() => isMobile && toggle()}
        />
      </a>
    </Link>
  )
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
