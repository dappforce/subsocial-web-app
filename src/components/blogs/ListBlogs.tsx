import BN from 'bn.js';
import React from 'react';

import { I18nProps } from '@polkadot/ui-app/types';
import { withCalls, withMulti } from '@polkadot/ui-api/with';

import { queryBlogsToProp, SeoHeads } from '../utils/index';
import translate from '../utils/translate';
import { ViewBlog } from './ViewBlog';
import { BlogId } from '../types';
import { AccountId } from '@polkadot/types';
import { useMyAccount } from '../utils/MyAccountContext';
import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { Loading } from '../utils/utils';
import { NextPage } from 'next';

type Props = I18nProps & {
  nextBlogId?: BN
};

export const ListBlogPage: NextPage<Props> = (props: Props) => {

  const { nextBlogId = new BlogId(1) } = props;

  const firstBlogId = new BlogId(1);
  const totalCount = nextBlogId.sub(firstBlogId).toNumber();
  const ids: BlogId[] = [];
  if (totalCount > 0) {
    const firstId = firstBlogId.toNumber();
    const lastId = nextBlogId.toNumber();
    for (let i = firstId; i < lastId; i++) {
      ids.push(new BlogId(i));
    }
  }

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={`All blogs (${totalCount})`}
        dataSource={ids}
        renderItem={(item, index) =>
          <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton />}
        noDataDesc='Blogs not created yet'
        noDataExt={<Button href='/blog/new'>Create blog</Button>}
      />
    </div>
  );
};

export const ListBlogs = translate(
  withCalls<Props>(
    queryBlogsToProp('nextBlogId')
  )(ListBlogPage)
);

type MyBlogProps = {
  id: AccountId,
  myblogsIds?: BlogId[]
};

const InnerListMyBlogs = (props: MyBlogProps) => {
  const { myblogsIds } = props;
  if (!myblogsIds) return <Loading />;

  const totalCount = myblogsIds.length;
  return (<>
    <SeoHeads title='List blogs' desc='Subsocial list blogs' image={substrateLogo} />
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <ListData
        title={`My Blogs (${totalCount})`}
        dataSource={myblogsIds}
        renderItem={(item, index) => <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton />}
        noDataDesc='You do not have your own blogs yet'
        noDataExt={<Button href='/blog/new'>Create my first blog</Button>}
      />
    </div>
  </>
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

export const ListMyBlogs = withMulti(
  InnerListMyBlogs,
  withIdFromUseMyAccount,
  withCalls<MyBlogProps>(
    queryBlogsToProp(`blogIdsByOwner`, { paramName: 'id', propName: 'myblogsIds' })
  )
);