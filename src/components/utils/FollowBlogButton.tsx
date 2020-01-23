import React, { useEffect, useState } from 'react';

import { GenericAccountId as AccountId, bool } from '@polkadot/types';

import { BlogId } from '../types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from './MyAccountContext';
import dynamic from 'next/dynamic';
const TxButton = dynamic(() => import('./TxButton'), { ssr: false });
import { isMobile } from 'react-device-detect';
import { getApi } from './utils';
type FollowBlogButtonProps = {
  blogId: BlogId,
  size?: string
};

export function FollowBlogButton (props: FollowBlogButtonProps) {
  const { blogId, size = isMobile ? 'tiny' : 'small' } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple([AccountId, BlogId], [new AccountId(myAddress), blogId]);

  const [ isFollow, setIsFollow ] = useState(false);

  useEffect(() => {
    let isSubscribe = true;
    const load = async () => {
      const api = await getApi();
      const _isFollow = await (api.query.blogs[`blogFollowedByAccount`](dataForQuery)) as bool;
      isSubscribe && setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

    return () => { isSubscribe = false; };
  });

  const buildTxParams = () => {
    return [ blogId ];
  };

  return <TxButton
    type='submit'
    compact
    size = {size}
    isBasic={isFollow}
    label={isFollow
      ? 'Unfollow'
      : 'Follow'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unfollowBlog`
      : `blogs.followBlog`}
    txSuccessCb={() => setIsFollow(!isFollow) }
  />;
}

export default FollowBlogButton;
