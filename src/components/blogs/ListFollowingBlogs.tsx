import React from 'react';

import { AccountId } from '@polkadot/types';
import { BlogId } from '../types';
import { ViewBlog, ViewBlogPage, loadBlogData, BlogData } from './ViewBlog';
import { Loading } from '../utils/utils';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import BN from 'bn.js';
import Router, { useRouter } from 'next/router';
import { Pluralize } from '../utils/Plularize';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { isMobile } from 'react-device-detect';
import { Api } from '../utils/SubstrateApi';
import { api as webApi, withMulti, withCalls } from '@polkadot/ui-api';
import { NextPage } from 'next';
import { queryBlogsToProp } from '../utils';
import { useMyAccount } from '../utils/MyAccountContext';

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

type ListBlogProps = {
  followedBlogIds?: BlogId[]
  id: AccountId
};

ListFollowingBlogsPage.getInitialProps = async (props): Promise<any> => {
  const { query: { address }, req } = props;
  console.log(props);
  const api = req ? await Api.setup() : webApi;
  const followedBlogIds = await api.query.blogs.blogsFollowedByAccount(new AccountId(address as string)) as unknown as BlogId[];
  const loadBlogs = followedBlogIds.map(id => loadBlogData(api, id));
  const blogsData = await Promise.all<BlogData>(loadBlogs);
  console.log(blogsData);
  return {
    blogsData
  };
};

const InnerListFollowingBlogs: NextPage<ListBlogProps> = (props: ListBlogProps) => {
  const { followedBlogIds } = props;
  const { toggle } = useSidebarCollapsed();
  const totalCount = followedBlogIds !== undefined ? followedBlogIds && followedBlogIds.length : 0;
  const router = useRouter();
  const { pathname, query } = router;
  const currentBlog = pathname.includes('blog') ? new BN(query.id as string) : undefined;

  console.log(followedBlogIds);

  if (!followedBlogIds) return <Loading />;

  const renderFollowedList = () => {

    return <>{totalCount > 0
      ? followedBlogIds.map((item, index) =>
        <div key={index} className={currentBlog && currentBlog.eq(item) ? 'DfSelectedBlog' : ''} >
          <ViewBlog
            {...props}
            key={index}
            id={item}
            onClick={() => {
              isMobile && toggle();
              console.log('Toggle');
              Router.push('/blog/[blogId]', `/blog/${item}`).catch(console.log);
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

function withIdFromUseMyAccount (Component: React.ComponentType<ListBlogProps>) {
  return function () {
    const { state: { address: myAddress } } = useMyAccount();
    try {
      console.log('My address', myAddress);
      return <Component id={new AccountId(myAddress)} />;
    } catch (err) {
      return <em>Invalid Account id</em>;
    }
  };
}

export const ListFollowingBlogs = withMulti(
  InnerListFollowingBlogs,
  withIdFromUseMyAccount,
  withCalls<ListBlogProps>(
    queryBlogsToProp(`blogsFollowedByAccount`, { paramName: 'id', propName: 'followedBlogsIds' })
  )
);

export default ListFollowingBlogs;
