import React, { useEffect, useState } from 'react';

import { GenericAccountId, bool as Bool } from '@polkadot/types';

import { BlogId } from '../types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { isMobile } from 'react-device-detect';
import { getApi } from './SubstrateApi';
import { useSidebarCollapsed } from './SideBarCollapsedContext';
import { registry } from '@polkadot/react-api';
import AccountId from '@polkadot/types/generic/AccountId';
type FollowBlogButtonProps = {
  blogId: BlogId,
  size?: string
};

export function FollowBlogButton (props: FollowBlogButtonProps) {
  const { blogId, size = isMobile ? 'tiny' : 'small' } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const { reloadFollowed } = useSidebarCollapsed();

  const dataForQuery = new Tuple(registry, [ AccountId, BlogId ], [ new GenericAccountId(registry, myAddress), blogId ]);

  const [ isFollow, setIsFollow ] = useState(false);

  const TxSuccess = () => {
    reloadFollowed();
    setIsFollow(!isFollow);
  };

  useEffect(() => {
    let isSubscribe = true;
    const load = async () => {
      const api = await getApi();
      const _isFollow = await (api.query.blogs[`blogFollowedByAccount`](dataForQuery)) as Bool;
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
    txSuccessCb={TxSuccess}
  />;
}

export default FollowBlogButton;
