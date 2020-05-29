import React, { useEffect, useState } from 'react';
import { useMyAddress } from './MyAccountContext';
import TxButton from './TxButton';
import { useSidebarCollapsed } from './SideBarCollapsedContext';
import BN from 'bn.js';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { newLogger } from '@subsocial/utils';
import { Loading } from './utils';
import { useSubsocialApi } from './SubsocialApiContext';

const log = newLogger('FollowSpaceButton')

type FollowSpaceButtonProps = {
  spaceId: BN,
  size?: Button$Sizes
};

type InnerFollowSpaceButtonProps = FollowSpaceButtonProps & {
  myAddress: string
};

export function FollowSpaceButton (props: FollowSpaceButtonProps) {
  const myAddress = useMyAddress()

  // Account cannot follow itself
  if (!myAddress) return null;

  return <InnerFollowSpaceButton {...props} myAddress={myAddress}/>;
}

export function InnerFollowSpaceButton (props: InnerFollowSpaceButtonProps) {
  const { spaceId, size = 'small', myAddress } = props;
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
      const _isFollow = await (substrate.isSpaceFollower(myAddress, spaceId))
      isSubscribe && setIsFollow(_isFollow)
    };
    load().catch(err => log.error(`Failed to check if the current account is following a space with id ${spaceId.toString()}. Error:`, err));

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  const buildTxParams = () => {
    return [ spaceId ];
  };

  return isFollow !== undefined ? <TxButton
    size={size}
    isBasic={isFollow}
    label={isFollow
      ? 'Unfollow'
      : 'Follow'
    }
    params={buildTxParams()}
    tx={isFollow
      ? `social.unfollowSpace`
      : `social.followSpace`
    }
    onSuccess={TxSuccess}
  /> : <Loading/>;
}

export default FollowSpaceButton;
