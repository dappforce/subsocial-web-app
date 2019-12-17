import React from 'react';

import { AccountId } from '@polkadot/types';
import { BlogId } from '../types';
import { ViewBlog } from './ViewBlog';
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

type ListBlogProps = {
  mini?: boolean
  followedBlogIds?: BlogId[]
};

const ListFollowingBlogs: NextPage<ListBlogProps> = (props: ListBlogProps) => {
  const { followedBlogIds, mini = false } = props;
  const { toggle } = useSidebarCollapsed();
  const totalCount = followedBlogIds !== undefined ? followedBlogIds && followedBlogIds.length : 0;
  const router = useRouter();
  const { pathname, query } = router;
  const currentBlog = pathname.includes('blog') ? new BN(query.id as string) : undefined;

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

  return (mini
    ? renderFollowedList()
    : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={<Pluralize count={totalCount} singularText='Following blog'/>}
        dataSource={followedBlogIds}
        renderItem={(item,index) => (
            <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton/>
        )}
        noDataDesc='You are not subscribed to any blog'
        noDataExt={<Button href='/blog/all'>Show all blogs</Button>}
      />
    </div>
  );
};

ListFollowingBlogs.getInitialProps = async (props): Promise<any> => {
  const { query: { address }, req } = props;
  console.log(props);
  const api = req ? await Api.setup() : webApi;
  const followedBlogIds = await api.query.blogs.blogsFollowedByAccount(new AccountId(address as string));
  console.log(followedBlogIds);
  return {
    followedBlogIds: followedBlogIds
  };
};

export default ListFollowingBlogs;
