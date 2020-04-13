import React, { useEffect, useState } from 'react';

import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { useMyAccount } from './MyAccountContext';
import TxButton from './TxButton';
import BN from 'bn.js';
import { useSubsocialApi } from './SubsocialApiContext';
import { newLogger } from '@subsocial/utils';

const log = newLogger('ShareButton')

type PropsShareButtonPost = {
  postId: BN
};

export function ShareButtonPost (props: PropsShareButtonPost) {
  const { postId } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const { substrate } = useSubsocialApi();

  if (!myAddress) return null;

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    let isSubscribe = true;

    const load = async () => {
      const _isFollow = await substrate.isPostSharedByAccount(myAddress, postId)
      isSubscribe && setIsFollow(_isFollow);
    };
    load().catch(err => log.error('Failed to share post check isFollow:', err));

    return () => { isSubscribe = false; };
  }, [ postId ]);

  const buildTxParams = () => {
    return [ postId ];
  };

  return <TxButton
    type='submit'
    isBasic={true}
    isPrimary={false}
    label={isFollow
      ? 'Unshare post'
      : 'Share post'}
    params={buildTxParams()}
    tx={isFollow
      ? `social.unsharePost`
      : `social.sharePost`}
    onSuccess={() => setTriggerReload(!triggerReload) }
  />;
}

type PropsShareButtonComment = {
  commentId: CommentId
};

export function ShareButtonComment (props: PropsShareButtonComment) {
  const { commentId } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const { substrate } = useSubsocialApi();

  if (!myAddress) return;

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await substrate.isCommentSharedByAccount(myAddress, commentId)
      setIsFollow(_isFollow);
    };
    load().catch(err => log.error('Failed to share comment check isFollow:', err));
  }, [ commentId ]);

  const buildTxParams = () => {
    return [ commentId ];
  };

  return <TxButton
    type='submit'
    size='tiny'
    isBasic={true}
    isPrimary={false}
    label={isFollow
      ? 'Unshare post'
      : 'Share post'}
    params={buildTxParams()}
    tx={isFollow
      ? `social.unshareComment`
      : `social.shareComment`}
    onSuccess={() => setTriggerReload(!triggerReload) }
  />;
}
