import React, { useEffect, useState } from 'react';

import { GenericAccountId as AccountId, bool } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { BUTTON_SIZE } from '../../config/Size.config';
import { getApi } from './utils';

type FollowAccountButtonProps = {
  address: string,
  size?: string
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

  const accountId = new AccountId(address);
  const dataForQuery = new Tuple([AccountId, AccountId], [new AccountId(myAddress), accountId]);

  const [ isFollow, setIsFollow ] = useState(true);

  useEffect(() => {
    let isSubscribe = true;
    const load = async () => {
      const api = await getApi();
      const _isFollow = await (api.query.blogs[`accountFollowedByAccount`](dataForQuery)) as bool;
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
    compact
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
