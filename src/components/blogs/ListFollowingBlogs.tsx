import React from 'react';

import { AccountId } from '@polkadot/types';
import { BlogId, Blog } from '../types';
import { ViewBlogPage, loadBlogData, BlogData } from './ViewBlog';
import { Loading } from '../utils/utils';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import BN from 'bn.js';
import Router, { useRouter } from 'next/router';
import { Pluralize } from '../utils/Plularize';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { isMobile } from 'react-device-detect';
import { Api } from '../utils/SubstrateApi';
import { api as webApi } from '@polkadot/ui-api';
import { NextPage } from 'next';

type ListBlogPageProps = {
  blogsData: BlogData[]
};

export const ListFollowingBlogsPage: NextPage<ListBlogPageProps> = (props: ListBlogPageProps) => {
  const { blogsData } = props;
  const totalCount = blogsData !== undefined ? blogsData && blogsData.length : 0;

  return (<div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={<Pluralize count={totalCount} singularText='Following blog'/>}
        dataSource={blogsData}
        renderItem={(item,index) => (
            <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton/>
        )}
        noDataDesc='You are not subscribed to any blog'
        noDataExt={<Button href='/blog/all'>Show all blogs</Button>}
      />
    </div>
  );
};

ListFollowingBlogsPage.getInitialProps = async (props): Promise<any> => {
  const { query: { address }, req } = props;
  console.log(props);
  const api = req ? await Api.setup() : webApi;
  const followedBlogsData = await api.query.blogs.blogsFollowedByAccount(new AccountId(address as string)) as unknown as BlogId[];
  const loadBlogs = followedBlogsData.map(id => loadBlogData(api, id));
  const blogsData = await Promise.all<BlogData>(loadBlogs);
  console.log(blogsData);
  return {
    blogsData
  };
};

type Props = {
  followedBlogsData: BlogData[]
};

const ListFollowingBlogs = (props: Props) => {
  const { followedBlogsData } = props;
  const { toggle } = useSidebarCollapsed();
  const totalCount = followedBlogsData !== undefined ? followedBlogsData && followedBlogsData.length : 0;
  const router = useRouter();
  const { pathname, query } = router;
  const currentBlog = pathname.includes('blog') ? new BN(query.id as string) : undefined;

  console.log(currentBlog);

  if (!followedBlogsData) return <Loading />;

  const renderFollowedList = () => {
    return <>{totalCount > 0
      ? followedBlogsData.map((item, index) =>
        <div key={index} className={currentBlog && item.blog && currentBlog.eq(item.blog.id) ? 'DfSelectedBlog' : ''} >
          <ViewBlogPage
            key={index}
            blogData={item}
            onClick={() => {
              isMobile && toggle();
              console.log('Toggle');
              Router.push('/blog/[blogId]', `/blog/${(item.blog as Blog).id}`).catch(console.log);
            }}
            miniPreview
            imageSize={28}
          />
        </div>)
      : <div className='DfNoFollowed'><Button type='primary' size='small' href='/blog/all'>Show all</Button></div>}
    </>;
  };

  return renderFollowedList();
};

export default ListFollowingBlogs;
