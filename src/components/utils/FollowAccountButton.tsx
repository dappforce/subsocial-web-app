import React, { useEffect, useState } from 'react';

import { GenericAccountId } from '@polkadot/types';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { registry } from '@polkadot/react-api';
import { TX_BUTTON_SIZE } from '../../config/Size.config';
import { Button$Sizes } from '@polkadot/react-components/Button/types';
import { newLogger } from '@subsocial/utils';
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
  const { state: { address: myAddress } } = useMyAccount()
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

  if (!myAddress || address === myAddress) return null;

  const buildTxParams = () => {
    return [ accountId ];
  };

  return isFollow !== undefined ? <TxButton
    className="DfFollowAccountButton"
    icon='send'
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
  /> : <Loading/>
}

export default FollowAccountButton;
