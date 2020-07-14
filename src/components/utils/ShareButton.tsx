import React, { useState } from 'react';
import { useMyAddress } from '../auth/MyAccountContext';
import TxButton from './TxButton';
import BN from 'bn.js';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { newLogger } from '@subsocial/utils';

const log = newLogger(ShareButtonPost.name)

type PropsShareButtonPost = {
  postId: BN
};

export function ShareButtonPost (props: PropsShareButtonPost) {
  const { postId } = props
  const myAddress = useMyAddress()

  if (!myAddress) return null

  const [ isFollow, setIsFollow ] = useState(false)
  const [ triggerReload, setTriggerReload ] = useState(false)

  useSubsocialEffect(({ substrate }) => {
    let isSubscribe = true

    const load = async () => {
      const _isFollow = await substrate.isPostSharedByAccount(myAddress, postId)
      isSubscribe && setIsFollow(_isFollow)
    };

    load().catch(err => log.error(
      `Failed to check if the current account shared a post with id ${postId.toString()}. ${err}`))

    return () => { isSubscribe = false }
  }, [ postId ])

  const buildTxParams = () => {
    return [ postId ]
  }

  return <TxButton
    label={isFollow
      ? 'Unshare post'
      : 'Share post'}
    params={buildTxParams()}
    tx={isFollow
      ? `posts.unsharePost`
      : `posts.sharePost`}
    onSuccess={() => setTriggerReload(!triggerReload)}
  />
}
