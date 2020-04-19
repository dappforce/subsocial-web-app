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

type InnerFollowBlogButtonProps = FollowBlogButtonProps & {
  myAddress: string
};

export function FollowBlogButton (props: FollowBlogButtonProps) {
  const { state: { address: myAddress } } = useMyAccount();

  // Account cannot follow itself
  if (!myAddress) return null;

  return <InnerFollowBlogButton {...props} myAddress={myAddress}/>;
}

export function InnerFollowBlogButton (props: InnerFollowBlogButtonProps) {
  const { blogId, size, myAddress } = props;
  const { substrate } = useSubsocialApi()
  const { reloadFollowed } = useSidebarCollapsed();
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
  }, [ myAddress ]);

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
