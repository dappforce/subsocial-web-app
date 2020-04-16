import React, { useEffect, useState } from 'react';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { useSidebarCollapsed } from './SideBarCollapsedContext';
import BN from 'bn.js';
import { Button$Sizes } from '@polkadot/react-components/Button/types';
import { newLogger } from '@subsocial/utils';
import { Loading } from './utils';
import { useSubsocialApi } from './SubsocialApiContext';

const log = newLogger('FollowBlogButton')

type FollowBlogButtonProps = {
  blogId: BN,
  size?: Button$Sizes
};

export function FollowBlogButton (props: FollowBlogButtonProps) {
  const { blogId, size } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const { substrate } = useSubsocialApi()
  const { reloadFollowed } = useSidebarCollapsed();

  if (!myAddress) return null;

  const [ isFollow, setIsFollow ] = useState<boolean>();

  const TxSuccess = () => {
    reloadFollowed();
    setIsFollow(!isFollow);
  };

  useEffect(() => {
    let isSubscribe = true;

    const load = async () => {
      const _isFollow = await (substrate.isBlogFollower(myAddress, blogId))
      isSubscribe && setIsFollow(_isFollow)
    };
    load().catch(err => log.error(`Failed to check if the current account is following a blog with id ${blogId.toString()}. Error:`, err));

    return () => { isSubscribe = false; };
  });

  const buildTxParams = () => {
    return [ blogId ];
  };

  return isFollow !== undefined ? <TxButton
    size = {size}
    isBasic={isFollow}
    label={isFollow
      ? 'Unfollow'
      : 'Follow'
    }
    params={buildTxParams()}
    tx={isFollow
      ? `social.unfollowBlog`
      : `social.followBlog`}
    onSuccess={TxSuccess}
  /> : <Loading/>;
}

export default FollowBlogButton;
