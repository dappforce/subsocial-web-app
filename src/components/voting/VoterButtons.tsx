import React, { useState } from 'react';
import Icon from 'antd/lib/icon';
import dynamic from 'next/dynamic';

import { Post, Reaction } from '@subsocial/types/substrate/interfaces/subsocial';
import { ReactionKind } from '@subsocial/types/substrate/classes';
import { newLogger } from '@subsocial/utils';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { useMyAccount } from '../auth/MyAccountContext';
import { BareProps } from '../utils/types';
import { IconWithLabel } from '../utils';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const log = newLogger('VoterButtons')

type VoterProps = BareProps & {
  post: Post,
  preview?: boolean
}

type ReactionType = 'Upvote' | 'Downvote'

type VoterButtonProps = VoterProps & {
  reactionType: ReactionType,
  reaction?: Reaction,
  onSuccess?: () => void,
  preview?: boolean
};

const VoterButton = ({
  reactionType,
  reaction,
  post: { id, upvotes_count, downvotes_count },
  className,
  style,
  onSuccess,
  preview
}: VoterButtonProps) => {
  const kind = reaction ? reaction && reaction.kind.toString() : 'None';
  const isUpvote = reactionType === 'Upvote'
  const count = isUpvote ? upvotes_count : downvotes_count
  const buildTxParams = () => {
    if (reaction === undefined) {
      return [ id, new ReactionKind(reactionType) ];
    } else if (kind !== reactionType) {
      return [ id, reaction.id, new ReactionKind(reactionType) ];
    } else {
      return [ id, reaction.id ];
    }
  };

  const isActive = kind === reactionType
  const color = isUpvote ? '#00a500' : '#ff0000'

  const changeReactionTx = kind !== reactionType
    ? `reactions.updatePostReaction`
    : `reactions.deletePostReaction`

  return <TxButton
    className={`DfVoterButton ${className}`}
    style={{ color: isActive ? color : '', ...style }}
    tx={!reaction
      ? `reactions.createPostReaction`
      : changeReactionTx
    }
    params={buildTxParams()}
    onSuccess={onSuccess}
  >
    <IconWithLabel
      icon={<Icon
        type={isUpvote ? 'like' : 'dislike'}
        theme={isActive ? 'twoTone' : 'outlined'}
        twoToneColor={isActive ? color : undefined }
      />}
      count={count}
      title={reactionType}
      withTitle={!preview}
    />
  </TxButton>
}

type VoterButtonsProps = VoterProps & {
  only?: 'Upvote' | 'Downvote',
}
export const VoterButtons = (props: VoterButtonsProps) => {
  const { post, only } = props
  const [ reactionState, setReactionState ] = useState<Reaction>();
  const { state: { address } } = useMyAccount();

  const [ state, setState ] = useState(post);
  const [ reloadTrigger, setReloadTrigger ] = useState(true);
  const { id } = state;

  useSubsocialEffect(({ substrate }) => {
    let isSubscribe = true;

    async function reloadPost () {
      if (post.id.toString() === id.toString()) return

      const _struct = await substrate.findPost({ id })
      if (isSubscribe && _struct) setState(_struct);
    }

    reloadPost().catch(err =>
      log.error(`Failed to load a post or comment. ${err}`));

    async function reloadReaction () {
      if (!address) return

      const reactionId = await substrate.getPostReactionIdByAccount(address, id)
      const reaction = await substrate.findReaction(reactionId)
      if (isSubscribe) {
        setReactionState(reaction);
      }
    }

    reloadReaction().catch(err =>
      log.error(`Failed to load a reaction. ${err}`));

    return () => { isSubscribe = false; };
  }, [ reloadTrigger, address, state ]);

  const renderVoterButton = (reactionType: ReactionType) => <VoterButton
    reaction={reactionState}
    reactionType={reactionType}
    onSuccess={() => setReloadTrigger(!reloadTrigger)}
    {...props}
  />

  const UpvoteButton = () => only !== 'Downvote' ? renderVoterButton('Upvote') : null
  const DownvoteButton = () => only !== 'Upvote' ? renderVoterButton('Downvote') : null

  return <>
    <UpvoteButton />
    <DownvoteButton />
  </>

};

export const UpvoteVoterButton = (props: VoterProps) => <VoterButtons only={'Upvote'} {...props} />
export const DownvoteVoterButton = (props: VoterProps) => <VoterButtons only={'Downvote'} {...props} />
