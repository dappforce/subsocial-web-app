import React, { useEffect, useState } from 'react';
import { useMyAddress } from './MyAccountContext';
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
  const myAddress = useMyAddress()
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
    load().catch(err => log.error(`Failed to check if the current account shared a post with id ${postId.toString()}. Error:`, err));

    return () => { isSubscribe = false; };
  }, [ postId ]);

  const buildTxParams = () => {
    return [ postId ];
  };

  return <TxButton
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
