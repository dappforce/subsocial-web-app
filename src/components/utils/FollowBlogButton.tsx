import React, { useEffect, useState } from 'react';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { isMobile } from 'react-device-detect';
import { useSidebarCollapsed } from './SideBarCollapsedContext';
import BN from 'bn.js';
import { Button$Sizes } from '@polkadot/react-components/Button/types';
import { useSubsocialApi } from './SubsocialApiContext';
import { newLogger } from '@subsocial/utils';

const log = newLogger('FollowBlogButton')

type FollowBlogButtonProps = {
  blogId: BN,
  size?: Button$Sizes
};

export function FollowBlogButton (props: FollowBlogButtonProps) {
  const { blogId, size = isMobile ? 'tiny' : 'small' } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const { reloadFollowed } = useSidebarCollapsed();

  if (!myAddress) return null;

  const { substrate } = useSubsocialApi()
  const [ isFollow, setIsFollow ] = useState(false);

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
    load().catch(err => log.error('Failed to check isFollow:', err));

    return () => { isSubscribe = false; };
  });

  const buildTxParams = () => {
    return [ blogId ];
  };

  return <TxButton
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
  />;
}

export default FollowBlogButton;
