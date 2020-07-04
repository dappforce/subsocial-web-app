import React, { useState } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import BN from 'bn.js';
import dynamic from 'next/dynamic';

import { Post, Reaction } from '@subsocial/types/substrate/interfaces/subsocial';
import { ReactionKind } from '@subsocial/types/substrate/classes';
import { newLogger } from '@subsocial/utils';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { useMyAccount } from '../auth/MyAccountContext';
import { PostVoters } from './ListVoters';
import { ZERO } from '../utils';

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const log = newLogger('Voter')

type VoterProps = {
  struct: Post
};

export const Voter = (props: VoterProps) => {
  const { struct } = props;

  const [ reactionState, setReactionState ] = useState<Reaction>();
  const { state: { address } } = useMyAccount();

  const kind = reactionState ? reactionState && reactionState.kind.toString() : 'None';
  const [ reactionKind, setReactionKind ] = useState(kind);
  const [ state, setState ] = useState(struct);
  const [ reloadTrigger, setReloadTrigger ] = useState(true);
  const { id } = state;

  useSubsocialEffect(({ substrate }) => {
    let isSubscribe = true;

    async function reloadPost () {
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
        reaction && setReactionKind(reaction.kind.toString());
      }
    }

    reloadReaction().catch(err =>
      log.error(`Failed to load a reaction. ${err}`));

    return () => { isSubscribe = false; };
  }, [ reloadTrigger, address ]);

  const buildTxParams = (param: 'Downvote' | 'Upvote') => {
    if (reactionState === undefined) {
      return [ id, new ReactionKind(param) ];
    } else if (reactionKind !== param) {
      return [ id, reactionState.id, new ReactionKind(param) ];
    } else {
      return [ id, reactionState.id ];
    }
  };

  const VoterRender = () => {
    let countColor = '';

    const calcVotingPercentage = (): number => {
      const { downvotes_count, upvotes_count } = state;
      const upvotesCount = new BN(upvotes_count);
      const downvotesCount = new BN(downvotes_count);
      const totalCount = upvotesCount.add(downvotesCount);
      if (totalCount.eq(ZERO)) return 0;

      const per = upvotesCount.toNumber() / totalCount.toNumber() * 100;
      const ceilPer = Math.ceil(per);

      if (per >= 50) {
        countColor = 'green';
        return ceilPer;
      } else {
        countColor = 'red';
        return 100 - ceilPer;
      }
    };

    const [ open, setOpen ] = useState(false);
    const close = () => setOpen(false);

    const renderTxButton = (isUpvote: boolean) => {
      const reactionName = isUpvote ? 'Upvote' : 'Downvote';
      const isActive = reactionKind === reactionName
      const color = isUpvote ? '#00a500' : '#ff0000'

      const changeReactionTx = reactionKind !== reactionName
        ? `reactions.updatePostReaction`
        : `reactions.deletePostReaction`

      return <TxButton
        tx={!reactionState
          ? `reactions.createPostReaction`
          : changeReactionTx
        }
        params={buildTxParams(reactionName)}
        onSuccess={() => setReloadTrigger(!reloadTrigger)}
      >
        <Icon
          type={isUpvote ? 'like' : 'dislike'}
          theme={isActive ? 'twoTone' : 'outlined'}
          twoToneColor={isActive ? color : undefined }
        />
      </TxButton>
    };

    const count = calcVotingPercentage();

    const percentageButton =
      <span
        className={`${countColor} active`}
        onClick={() => setOpen(true)}
      >{count}%</span>

    return <>
      <Button.Group className={`DfVoter`}>
        {renderTxButton(true)}
        {percentageButton}
        {renderTxButton(false)}
      </Button.Group>
      {open && <PostVoters id={id} open={open} close={close} />}
    </>;
  };

  return <VoterRender/>;
};

export default Voter;
