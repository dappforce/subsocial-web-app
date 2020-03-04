import React, { useEffect, useState } from 'react';

import { CommentId } from '@subsocial/types/interfaces/runtime';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import { api, registry } from '@polkadot/react-api';
import { GenericAccountId } from '@polkadot/types';
import Bool from '@polkadot/types/primitive/Bool';
import BN from 'bn.js';

type PropsShareButtonPost = {
  postId: BN
};

export function ShareButtonPost (props: PropsShareButtonPost) {
  const { postId } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple(registry, [ 'AccountId', 'u64' ], [ new GenericAccountId(registry, myAddress), postId ]);

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    let isSubscribe = true;

    const load = async () => {
      const _isFollow = await (api.query.blogs[`postSharedByAccount`](dataForQuery)) as Bool;
      isSubscribe && setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

    return () => { isSubscribe = false; };
  }, [ postId ]);

  const buildTxParams = () => {
    return [ postId ];
  };

  return <TxButton
    type='submit'
    compact
    isBasic={true}
    isPrimary={false}
    label={isFollow
      ? 'Unshare post'
      : 'Share post'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unsharePost`
      : `blogs.sharePost`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  />;
}

type PropsShareButtonComment = {
  commentId: CommentId
};

export function ShareButtonComment (props: PropsShareButtonComment) {
  const { commentId } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple(registry, [ 'AccountId', 'u64' ], [ new GenericAccountId(registry, myAddress), commentId ]);

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`commentSharedByAccount`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));
  }, [ commentId ]);

  const buildTxParams = () => {
    return [ commentId ];
  };

  return <TxButton
    type='submit'
    compact
    size='tiny'
    isBasic={true}
    isPrimary={false}
    label={isFollow
      ? 'Unshare post'
      : 'Share post'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unshareComment`
      : `blogs.shareComment`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  />;
}
