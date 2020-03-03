import React, { useEffect, useState } from 'react';

import { GenericAccountId, bool as Bool } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { api, registry } from '@polkadot/react-api';
import { BUTTON_SIZE } from '../../config/Size.config';
import { Button$Sizes } from '@polkadot/react-components/Button/types';
import AccountId from '@polkadot/types/generic/AccountId';

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
  const { myAddress, address, size = BUTTON_SIZE } = props;

  const accountId = new GenericAccountId(address);
  const dataForQuery = new Tuple(registry, [ AccountId, AccountId ], [ new GenericAccountId(myAddress), accountId ]);

  const [ isFollow, setIsFollow ] = useState(true);

  useEffect(() => {
    let isSubscribe = true;
    const load = async () => {
      const _isFollow = await (api.query.blogs[`accountFollowedByAccount`](dataForQuery)) as Bool;
      isSubscribe && setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

    return () => { isSubscribe = false; };
  });

  const buildTxParams = () => {
    return [ accountId ];
  };

  return <TxButton
    type='submit'
    size={size}
    isBasic={isFollow}

    label={isFollow
      ? 'Unfollow'
      : 'Follow'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unfollowAccount`
      : `blogs.followAccount`}
    txSuccessCb={() => setIsFollow(!isFollow) }
  />;
}

export default FollowAccountButton;
