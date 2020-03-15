import React from 'react';

import { AccountId } from '@polkadot/types';
import { BlogId, Blog } from '../types';
import { ViewBlogPage, loadBlogData, BlogData } from './ViewBlog';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import BN from 'bn.js';
import { useRouter } from 'next/router';
import { Pluralize } from '../utils/Plularize';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { isMobile } from 'react-device-detect';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { getApi } from '../utils/SubstrateApi';
import Link from 'next/link';

type ListBlogPageProps = {
  blogsData: BlogData[]
};

export const ListFollowingBlogsPage: NextPage<ListBlogPageProps> = (props: ListBlogPageProps) => {
  const { blogsData } = props;
  const totalCount = blogsData !== undefined ? blogsData && blogsData.length : 0;

  return (<div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
    <HeadMeta title='Blogs I follow' desc='Subsocial blogs' />
    <ListData
      title={<Pluralize count={totalCount} singularText='Following blog'/>}
      dataSource={blogsData}
      renderItem={(item, index) => (
        <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton/>
      )}
      noDataDesc='You are not subscribed to any blog'
      noDataExt={<Button href='/blogs/all'>Show all blogs</Button>}
    />
  </div>
  );
};

ListFollowingBlogsPage.getInitialProps = async (props): Promise<any> => {
  const { query: { address } } = props;
  const api = await getApi();
  const followedBlogsData = await api.query.blogs.blogsFollowedByAccount(new AccountId(address as string)) as unknown as BlogId[];
  const loadBlogs = followedBlogsData.map(id => loadBlogData(api, id));
  const blogsData = await Promise.all<BlogData>(loadBlogs);
  return {
    blogsData
  };
};

type Props = {
  followedBlogsData: BlogData[]
};

export const RenderFollowedList = (props: Props) => {
  const { followedBlogsData } = props;
  const totalCount = followedBlogsData !== undefined ? followedBlogsData && followedBlogsData.length : 0;
  const router = useRouter();
  const { pathname, query } = router;
  const currentBlog = pathname.includes('blogs') ? new BN(query.blogId as string) : undefined;
  const { toggle } = useSidebarCollapsed();

  return <>{totalCount > 0
    ? followedBlogsData.map((item, index) =>
      <Link key={index} href='/blogs/[blogId]' as={`/blogs/${(item.blog as Blog).id}`}>
        <a className='DfMenuItem'>
          <div className={currentBlog && item.blog && currentBlog.eq(item.blog.id) ? 'DfSelectedBlog' : ''} >
            <ViewBlogPage
              key={index}
              blogData={item}
              onClick={() => {
                isMobile && toggle();
              }}
              miniPreview
              imageSize={28}
            />
          </div>
        </a>
      </Link>)
    : <div className='DfNoFollowed'><Button type='primary' size='small' href='/blogs/all'>Show all</Button></div>}
  </>;
};

export default RenderFollowedList;
