import React, { useEffect, useState } from 'react';

import { GenericAccountId, bool as Bool } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { registry } from '@polkadot/react-api';
import { TX_BUTTON_SIZE } from '../../config/Size.config';
import { Button$Sizes } from '@polkadot/react-components/Button/types';
import AccountId from '@polkadot/types/generic/AccountId';
import { useSubsocialApi } from './SubsocialApiContext';
import { newLogger } from '@subsocial/utils';

const log = newLogger('FollowAccountButton')

type FollowAccountButtonProps = {
  address: string,
  size?: Button$Sizes
};

export function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address } = props;
  const { state: { address: myAddress } } = useMyAccount();

  // Account cannot follow itself
  if (!myAddress || address === myAddress) return null;

  return <InnerFollowAccountButton {...props} myAddress={myAddress}/>;
}

type InnerFollowAccountButtonProps = FollowAccountButtonProps & {
  myAddress: string
};

function InnerFollowAccountButton (props: InnerFollowAccountButtonProps) {
  const { myAddress, address, size = TX_BUTTON_SIZE } = props;

  const accountId = new GenericAccountId(registry, address);
  const dataForQuery = new Tuple(registry, [ AccountId, AccountId ], [ new GenericAccountId(registry, myAddress), accountId ]);

  const { state: { substrate } } = useSubsocialApi()
  const [ isFollow, setIsFollow ] = useState(true);

  useEffect(() => {
    let isSubscribe = true;
    const load = async () => {
      const _isFollow = await (substrate.socialQuery().accountFollowedByAccount(dataForQuery)) as Bool;
      isSubscribe && setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => log.error('Failed to check isFollow:', err));

    return () => { isSubscribe = false; };
  });

  const buildTxParams = () => {
    return [ accountId ];
  };

  return <TxButton
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
  />
}

export default FollowAccountButton;
