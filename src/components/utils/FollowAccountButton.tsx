import React, { useEffect, useState } from 'react';
import { GenericAccountId } from '@polkadot/types';
import { useMyAddress, isMyAddress } from '../auth/MyAccountContext';
import { registry } from '@subsocial/react-api';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { newLogger, notDef } from '@subsocial/utils';
import { useSubsocialApi } from './SubsocialApiContext';
import TxButton from './TxButton';
import { Loading } from './utils';
import AccountId from '@polkadot/types/generic/AccountId';
import { TX_BUTTON_SIZE } from 'src/config/Size.config';

const log = newLogger('FollowAccountButton')

type FollowAccountButtonProps = {
  address: string | AccountId
  size?: Button$Sizes
  className?: string
}

function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address, size = TX_BUTTON_SIZE, className = '' } = props;
  const myAddress = useMyAddress()
  const accountId = new GenericAccountId(registry, address);
  const { substrate } = useSubsocialApi()

  const [ isFollow, setIsFollow ] = useState<boolean>();

  useEffect(() => {
    let isSubscribe = true;

    if (!myAddress) return isSubscribe && setIsFollow(false);

    const load = async () => {
      const _isFollow = await (substrate.isAccountFollower(myAddress, address))
      isSubscribe && setIsFollow(_isFollow);
    };
    load().catch(err => log.error('Failed to check isFollow:', err));

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  if (isMyAddress(address)) return null;

  const buildTxParams = () => {
    return [ accountId ];
  };

  return <span className={className}>{notDef(isFollow)
    ? <Loading />
    : <TxButton
      className="DfFollowAccountButton"
      size={size}
      isBasic={isFollow}
      label={isFollow
        ? 'Unfollow'
        : 'Follow'}
      params={buildTxParams()}
      tx={isFollow
        ? `profileFollows.unfollowAccount`
        : `profileFollows.followAccount`}
      onSuccess={() => setIsFollow(!isFollow)}
      withSpinner
    />
  }</span>
}

export default FollowAccountButton;
