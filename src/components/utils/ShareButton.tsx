import React, { useEffect, useState } from 'react';

import { GenericAccountId, bool } from '@polkadot/types';

import { BlogId, PostId, CommentId } from '../types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from './MyAccountContext';
const TxButton = dynamic(() => import('./TxButton'), { ssr: false });
import { getApi } from './utils';
import dynamic from 'next/dynamic';

type PropsShareButtonPost = {
  postId: PostId
};

export function ShareButtonPost (props: PropsShareButtonPost) {
  const { postId } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple([GenericAccountId, BlogId], [new GenericAccountId(myAddress), postId]);

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    let isSubscribe = true;

    const load = async () => {
      const api = await getApi();
      const _isFollow = await (api.query.blogs[`postSharedByAccount`](dataForQuery)) as bool;
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

  const dataForQuery = new Tuple([GenericAccountId, BlogId], [new GenericAccountId(myAddress), commentId]);

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const api = await getApi();
      const _isFollow = await (api.query.blogs[`commentSharedByAccount`](dataForQuery)) as bool;
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
