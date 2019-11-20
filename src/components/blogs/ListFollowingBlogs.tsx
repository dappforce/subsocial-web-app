import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '../utils/index';
import { BlogId } from '../types';
import ViewBlog from './ViewBlog';
import { useMyAccount } from '../utils/MyAccountContext';
import { pluralizeText } from '../utils/utils';
import ListData from '../utils/DataList';

type MyBlogProps = {
  id: AccountId,
  mini?: boolean
  followedBlogsIds?: BlogId[]
};

const InnerListMyBlogs = (props: MyBlogProps) => {
  const { followedBlogsIds, mini = false } = props;
  const totalCount = followedBlogsIds !== undefined ? followedBlogsIds && followedBlogsIds.length : 0;
  if (!followedBlogsIds) return <em>Loading</em>;

  return (mini
      ? <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
          <ListData
            title={pluralizeText(totalCount, 'Following blog')}
            dataSource={followedBlogsIds}
            renderItem={(item,index) => (
                <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton/>
            )}
          />
      </div>
      : <>{followedBlogsIds.map((item, index) => <ViewBlog {...props} key={index} id={item} miniPreview imageSize={28}/>)}</>
  );
};

function withIdFromUseMyAccount (Component: React.ComponentType<MyBlogProps>) {
  return function () {
    const { state: { address: myAddress } } = useMyAccount();
    try {
      return <Component id={new AccountId(myAddress)} />;
    } catch (err) {
      return <em>Invalid Account id</em>;
    }
  };
}

export const ListFollowingBlogs = withMulti(
  InnerListMyBlogs,
  withIdFromUseMyAccount,
  withCalls<MyBlogProps>(
    queryBlogsToProp(`blogsFollowedByAccount`, { paramName: 'id', propName: 'followedBlogsIds' })
  )
);

export default ListFollowingBlogs;
