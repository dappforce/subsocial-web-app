import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';

import dynamic from 'next/dynamic';
import { Option, GenericAccountId, Enum } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '../utils/MyAccountContext';
import { CommentVoters, PostVoters } from './ListVoters';
import { Post, Reaction, Comment, ReactionId } from '@subsocial/types/interfaces/runtime';
import { Icon } from 'antd';
import BN from 'bn.js';
import { getApi } from '../utils/SubstrateApi';
import { registry } from '@polkadot/react-api';
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

const ZERO = new BN(0);

type VoterProps = {
  struct: Comment | Post,
  type: 'Comment' | 'Post'
};

export const Voter = (props: VoterProps) => {
  const {
    struct,
    type
  } = props;

  const [ reactionState, setReactionState ] = useState(undefined as (Reaction | undefined));

  const { state: { address } } = useMyAccount();

  const kind = reactionState ? reactionState && reactionState.kind.toString() : 'None';
  const [ reactionKind, setReactionKind ] = useState(kind);
  const [ state, setState ] = useState(struct);
  const [ updateTrigger, setUpdateTrigger ] = useState(true);
  const { id } = state;
  const isComment = type === 'Comment';
  const structQuery = type.toLowerCase();

  const dataForQuery = new Tuple(registry, [ 'AccountId', 'u64' ], [ new GenericAccountId(registry, address), id ]);

  useEffect(() => {
    let isSubscribe = true;

    async function loadStruct<T extends Comment | Post> (_: T) {
      const api = await getApi();
      const result = await api.query.social[`${structQuery}ById`](id) as Option<T>;
      if (result.isNone) return;

      const _struct = result.unwrap();
      if (isSubscribe) setState(_struct);
    }
    loadStruct(state).catch(err => console.log(err));

    async function loadReaction () {
      const api = await getApi();
      const reactionId = await api.query.social[`${structQuery}ReactionIdByAccount`](dataForQuery) as ReactionId;
      const reactionOpt = await api.query.social.reactionById(reactionId) as Option<Reaction>;
      if (reactionOpt.isNone) {
        isSubscribe && setReactionState(undefined);
      } else {
        const reaction = reactionOpt.unwrap() as Reaction;
        if (isSubscribe) {
          setReactionState(reaction);
          setReactionKind(reaction.kind.toString());
        }
      }
    }
    loadReaction().catch(console.log);

    return () => { isSubscribe = false; };
  }, [ updateTrigger, address ]);

  const buildTxParams = (param: 'Downvote' | 'Upvote') => {
    if (reactionState === undefined) {
      return [ id, new Enum(registry, { kind: 'Text' } ,param) ];
    } else if (reactionKind !== param) {
      return [ id, reactionState.id, new Enum(registry, { kind: 'Text' } ,param) ];
    } else {
      return [ id, reactionState.id ];
    }
  };

  const VoterRender = () => {
    let countColor = '';

    const calcVotingPercentage = () => {
      const { downvotes_count, upvotes_count } = state;
      const totalCount = new BN(upvotes_count).add(downvotes_count);
      if (totalCount.eq(ZERO)) return 0;

      const per = upvotes_count.toNumber() / totalCount.toNumber() * 100;
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
      const color = isUpvote ? 'green' : 'red';
      const isActive = (reactionKind === reactionName) && 'active';
      const icon = isUpvote ? '' : 'dis';

      return (<TxButton
        type='submit'
        compact
        className={`${color} ${isActive}`}
        params={buildTxParams(reactionName)}
        txSuccessCb={() => setUpdateTrigger(!updateTrigger)}
        tx={!reactionState
          ? `social.create${type}Reaction`
          : (reactionKind !== `${reactionName}`)
            ? `social.update${type}Reaction`
            : `social.delete${type}Reaction`}
      >
        <Icon type={`${icon}like`}/>
      </TxButton>);
    };

    const count = calcVotingPercentage();

    return <>
      <Button.Group className={`DfVoter`}>
        {renderTxButton(true)}
        <Button content={ count === 0 ? count.toString() : count + '%' } variant='primary' className={`${countColor} active`} onClick={() => setOpen(true)}/>
        {renderTxButton(false)}
      </Button.Group>
      {isComment
        ? open && <CommentVoters id={id} open={open} close={close}/>
        : open && <PostVoters id={id} open={open} close={close}/>}
    </>;
  };

  return <VoterRender/>;
};

export default Voter;
