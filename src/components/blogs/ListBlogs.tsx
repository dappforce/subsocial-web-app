import BN from 'bn.js';
import React from 'react';

import { ApiProps } from '@polkadot/ui-api/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { withCalls, withMulti } from '@polkadot/ui-api/with';

import Section from '../utils/Section';
import { queryBlogsToProp, SeoHeads } from '../utils/index';
import translate from '../utils/translate';
import ViewBlog from './ViewBlog';
import { BlogId } from '../types';
import { AccountId } from '@polkadot/types';
import { useMyAccount } from '../utils/MyAccountContext';
import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';
import ListData from '../utils/ListData';

type Props = ApiProps & I18nProps & {
  nextBlogId?: BN
};

class Component extends React.PureComponent<Props> {

  render () {
    const { nextBlogId = new BlogId(1) } = this.props;

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
      ids.length === 0
          ? <Section><em>No blogs created yet.</em></Section>
          : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
            <ListData
              title={`All blogs (${totalCount})`}
              dataSource={ids}
              renderItem={(item, index) =>
                <ViewBlog {...this.props} key={index} id={item} previewDetails withFollowButton />}
            />
            </div>
    );
  }
}

export const ListBlogs = translate(
  withCalls<Props>(
    queryBlogsToProp('nextBlogId')
  )(Component)
);

type MyBlogProps = {
  id: AccountId,
  myblogsIds?: BlogId[]
};

const InnerListMyBlogs = (props: MyBlogProps) => {
  const { myblogsIds } = props;
  const totalCount = myblogsIds && myblogsIds.length;
  return (<>
  <SeoHeads title='List blogs' desc='Subsocial list blogs' image={substrateLogo} />
  {myblogsIds && myblogsIds.length === 0
      ? <Section><em>No blogs created yet.</em></Section>
      : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
          <ListData
            title={`MyBlogs (${totalCount})`}
            dataSource={myblogsIds}
            renderItem={(index, item) => <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton />}
          />
        </div>
  }</>
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

export default ListBlogs;
