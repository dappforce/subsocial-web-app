import React, { useState } from 'react';
import { useMyAddress } from '../auth/MyAccountContext';
import TxButton from './TxButton';
import { useSidebarCollapsed } from './SideBarCollapsedContext';
import BN from 'bn.js';
import { newLogger, notDef } from '@subsocial/utils';
import { Loading } from '.';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { BaseTxButtonProps } from '../substrate/SubstrateTxButton';

const log = newLogger('FollowSpaceButton')

type FollowSpaceButtonProps = BaseTxButtonProps & {
  spaceId: BN,
};

type InnerFollowSpaceButtonProps = FollowSpaceButtonProps & {
  myAddress?: string
};

export function FollowSpaceButton (props: FollowSpaceButtonProps) {
  const myAddress = useMyAddress()

  return <InnerFollowSpaceButton {...props} myAddress={myAddress}/>;
}

export function InnerFollowSpaceButton (props: InnerFollowSpaceButtonProps) {
  const { spaceId, myAddress, ...otherProps } = props;
  const { reloadFollowed } = useSidebarCollapsed();
  const [ isFollower, setIsFollower ] = useState<boolean>();

  const onTxSuccess = () => {
    reloadFollowed();
    setIsFollower(!isFollower);
  };

  useSubsocialEffect(({ substrate }) => {
    let isSubscribe = true;

    if (!myAddress) return isSubscribe && setIsFollower(false)

    const load = async () => {
      const res = await (substrate.isSpaceFollower(myAddress, spaceId))
      isSubscribe && setIsFollower(res)
    };

    load().catch(err => log.error(
      `Failed to check if the current account is following a space with id ${spaceId.toString()}. Error:`, err));

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  const buildTxParams = () => [ spaceId ]

  return notDef(isFollower)
    ? <Loading />
    : <TxButton
      type='primary'
      ghost={isFollower}
      label={isFollower
        ? 'Unfollow'
        : 'Follow'}
      tx={isFollower
        ? `spaceFollows.unfollowSpace`
        : `spaceFollows.followSpace`}
      params={buildTxParams}
      onSuccess={onTxSuccess}
      withSpinner
      {...otherProps}
    />
}

export default FollowSpaceButton;
