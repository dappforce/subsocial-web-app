import React, { useEffect, useState } from 'react';
import { GenericAccountId } from '@polkadot/types';
import { useMyAddress, isMyAddress } from '../auth/MyAccountContext';
import { registry } from '@subsocial/react-api';
import { newLogger, notDef } from '@subsocial/utils';
import { useSubsocialApi } from './SubsocialApiContext';
import TxButton from './TxButton';
import { Loading } from './utils';
import AccountId from '@polkadot/types/generic/AccountId';

const log = newLogger('FollowAccountButton')

type FollowAccountButtonProps = {
  address: string | AccountId
  className?: string
}

function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address, className = '' } = props;
  const myAddress = useMyAddress()
  const { substrate } = useSubsocialApi()
  const [ isFollower, setIsFollower ] = useState<boolean>();

  useEffect(() => {
    let isSubscribe = true;

    if (!myAddress) return isSubscribe && setIsFollower(false);

    const load = async () => {
      const res = await substrate.isAccountFollower(myAddress, address)
      isSubscribe && setIsFollower(res);
    };

    load().catch(err => log.error(
      `Failed to check if account is a follower of another account ${address?.toString()}. Error:`, err));

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  if (!address || isMyAddress(address)) return null;

  const accountId = new GenericAccountId(registry, address)

  const buildTxParams = () => [ accountId ]

  return <span className={className}>{notDef(isFollower)
    ? <Loading />
    : <TxButton
      className='DfFollowAccountButton'
      type='primary'
      ghost={isFollower}
      label={isFollower
        ? 'Unfollow'
        : 'Follow'}
      tx={isFollower
        ? `profileFollows.unfollowAccount`
        : `profileFollows.followAccount`}
      params={buildTxParams}
      onSuccess={() => setIsFollower(!isFollower)}
      withSpinner
    />
  }</span>
}

export default FollowAccountButton;
