import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '../utils/index';
import { BlogId } from '../types';
import ViewBlog from './ViewBlog';
import { useMyAccount } from '../utils/MyAccountContext';
import { Loading } from '../utils/utils';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import BN from 'bn.js';
import Router, { useRouter } from 'next/router';
import { Pluralize } from '../utils/Plularize';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';

type ListBlogProps = {
  id: AccountId,
  mini?: boolean
  followedBlogsIds?: BlogId[]
};

const InnerListMyBlogs = (props: ListBlogProps) => {
  const { followedBlogsIds, mini = false } = props;
  const { toggle } = useSidebarCollapsed();
  const totalCount = followedBlogsIds !== undefined ? followedBlogsIds && followedBlogsIds.length : 0;
  const router = useRouter();
  const { pathname, query } = router;
  const currentBlog = pathname.includes('blog') ? new BN(query.id as string) : undefined;
  console.log([pathname.includes('blog'), currentBlog, pathname, query]);

  if (!followedBlogsIds) return <Loading />;

  const renderFollowedList = () => {

    return <>{totalCount > 0
      ? followedBlogsIds.map((item, index) =>
        <div key={index} className={currentBlog && currentBlog.eq(item) ? 'DfSelectedBlog' : ''} >
          <ViewBlog
            {...props}
            key={index}
            id={item}
            onClick={() => {
              toggle();
              console.log('Toggle');
              Router.push(`/blog?id=${item}`);
            }}
            miniPreview
            imageSize={28}
          />
        </div>)
      : <div className='DfNoFollowed'><Button type='primary' size='small' href='/all'>Show all</Button></div>}
    </>;
  };

  return (mini
    ? renderFollowedList()
    : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={<Pluralize count={totalCount} singularText='Following blog'/>}
        dataSource={followedBlogsIds}
        renderItem={(item,index) => (
            <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton/>
        )}
        noDataDesc='You are not subscribed to any blog'
        noDataExt={<Button href='/all'>Show all blogs</Button>}
      />
    </div>
  );
};

function withIdFromUseMyAccount (Component: React.ComponentType<ListBlogProps>) {
  return function (props: ListBlogProps) {
    const { state: { address: myAddress } } = useMyAccount();
    try {
      return <Component id={new AccountId(myAddress)} {...props}/>;
    } catch (err) {
      return <em>Invalid Account id</em>;
    }
  };
}

export const ListFollowingBlogs = withMulti<ListBlogProps>(
  InnerListMyBlogs,
  withIdFromUseMyAccount,
  withCalls<ListBlogProps>(
    queryBlogsToProp(`blogsFollowedByAccount`, { paramName: 'id', propName: 'followedBlogsIds' })
  )
);

export default ListFollowingBlogs;
