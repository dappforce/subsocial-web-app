import BN from 'bn.js';
import React from 'react';

import { ApiProps } from '@polkadot/ui-api/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { withCalls } from '@polkadot/ui-api/with';
import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';
import { queryBlogsToProp, SeoHeads } from '../utils/index';
import translate from '../utils/translate';
import ViewBlog from '../blogs/ViewBlog';
import { BlogId, PostId } from '../types';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import { ViewPost } from '../posts/ViewPost';

const FIVE = new BlogId(1);
const ZERO = new BlogId(0);
type Props = ApiProps & I18nProps & {
  nextBlogId?: BN,
  nextPostId?: BN
};

const Component = (props: Props) => {

  const { nextBlogId = new BlogId(1), nextPostId = new PostId(1) } = props;

  const getLastNIds = (nextId: BN, size: BN): BN[] => {
    const initIds = nextId.lt(size) ? nextId.toNumber() - 1 : size.toNumber();
    let latestIds = new Array<BN>(initIds).fill(ZERO);

    return latestIds.map((_,index) => nextId.sub(new BN(index + 1)));
  };

  const latestBlogIds = getLastNIds(nextBlogId, FIVE);
  const latestPostIds = getLastNIds(nextPostId, FIVE);

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <SeoHeads title='Subsocial latestt updates' name='Home' desc='Subsocial home page with latestt updates' image={substrateLogo} />
      <ListData
        title={`Latest blogs`}
        dataSource={latestBlogIds}
        renderItem={(item, index) =>
          <ViewBlog {...props} key={index} id={item} previewDetails withFollowButton />}
        noDataDesc='No latestt updates yet'
        noDataExt={<Button href='/new-blog'>Create blog</Button>}
      />
      {latestPostIds.length > 0 && <ListData
        title={`Latest posts`}
        dataSource={latestPostIds}
        renderItem={(item, index) =>
          <ViewPost key={index} id={item} preview />}
      />}
    </div>
  );
};

export const LatestUpdate = translate(
  withCalls<Props>(
    queryBlogsToProp('nextBlogId'),
    queryBlogsToProp('nextPostId')
  )(Component)
);

export default LatestUpdate;
