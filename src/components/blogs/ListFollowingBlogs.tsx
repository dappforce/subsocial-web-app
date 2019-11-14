import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '../utils/index';
import { BlogId } from '../types';
import Section from '../utils/Section';
import ViewBlog from './ViewBlog';
import { useMyAccount } from '../utils/MyAccountContext';
import { pluralizeText } from '../utils/utils';
import { List } from 'antd';

type MyBlogProps = {
  id: AccountId,
  followedBlogsIds?: BlogId[]
};

const InnerListMyBlogs = (props: MyBlogProps) => {
  const { followedBlogsIds } = props;
  const totalCount = followedBlogsIds !== undefined ? followedBlogsIds && followedBlogsIds.length : 0;

  return (
  <Section title={pluralizeText(totalCount, 'Following blog')}>{
    followedBlogsIds && followedBlogsIds.length === 0
      ? <em>No blogs created yet.</em>
      : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
          <List
            itemLayout='vertical'
            size='large'
            pagination={{
              onChange: page => {
                console.log(page);
              },
              pageSize: 3
            }}
            dataSource={followedBlogsIds}
            renderItem={(item,index) => (
              <List.Item
                key={index}
              >
                <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton />
              </List.Item>
            )}
          />
        </div>
  }</Section>
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
