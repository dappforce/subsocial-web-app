import React, { useEffect, useState } from 'react';
import { GenericAccountId } from '@polkadot/types';
import { useMyAddress, isMyAddress } from './MyAccountContext';
import TxButton from './TxButton';
import { registry } from '@subsocial/react-api';
import { TX_BUTTON_SIZE } from '../../config/Size.config';
import { Button$Sizes } from '@subsocial/react-components/Button/types';
import { newLogger, notDef } from '@subsocial/utils';
import { Loading } from './utils';
import { useSubsocialApi } from './SubsocialApiContext';
import { AccountId } from '@polkadot/types/interfaces';

const log = newLogger('FollowAccountButton')

type FollowAccountButtonProps = {
  address: string | AccountId,
  size?: Button$Sizes
}

function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address, size = TX_BUTTON_SIZE } = props;
  const myAddress = useMyAddress()
  const accountId = new GenericAccountId(registry, address);
  const { substrate } = useSubsocialApi()

  const [ isFollow, setIsFollow ] = useState<boolean>();

  useEffect(() => {
    if (!myAddress) return;

    let isSubscribe = true;
    const load = async () => {
      const _isFollow = await (substrate.isAccountFollower(myAddress, address))
      isSubscribe && setIsFollow(_isFollow);
    };
    load().catch(err => log.error('Failed to check isFollow:', err));

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  if (!myAddress || isMyAddress(address)) return null;

  const buildTxParams = () => {
    return [ accountId ];
  };

  return notDef(isFollow) ? <Loading/> : <TxButton
    className="DfFollowAccountButton"
    size={size}
    isBasic={isFollow}
    label={isFollow
      ? 'Unfollow'
      : 'Follow'}
    params={buildTxParams()}
    tx={isFollow
      ? `social.unfollowAccount`
      : `social.followAccount`}
    onSuccess={() => setIsFollow(!isFollow)}
    withSpinner
  />
}

export default FollowAccountButton;
