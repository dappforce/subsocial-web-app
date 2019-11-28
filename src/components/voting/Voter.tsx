import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';

import TxButton from '../utils/TxButton';
import { api } from '@polkadot/ui-api';
import { AccountId, Option } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '../utils/MyAccountContext';
import { CommentVoters, PostVoters } from './ListVoters';
import { Post, Reaction, CommentId, PostId, ReactionKind, Comment } from '../types';
import { Icon } from 'antd';
import BN from 'bn.js';

const ZERO = new BN(0);

type VoterValue = {
  struct: Comment | Post;
};

type VoterProps = VoterValue;

export const Voter = (props: VoterProps) => {
  const {
    struct
  } = props;

  const [ reactionState, setReactionState ] = useState(undefined as (Reaction | undefined));

  const { state: { address } } = useMyAccount();

  const kind = reactionState ? reactionState && reactionState.kind.toString() : 'None';
  const [ reactionKind, setReactionKind ] = useState(kind);
  const [ state , setState ] = useState(struct);
  const { id } = state;
  const isComment = struct.Type['id'] === CommentId.name;
  const Id = isComment ? CommentId : PostId;

  const dataForQuery = new Tuple([AccountId, Id], [new AccountId(address), id]);

  useEffect(() => {

    const structQuery = isComment ? 'comment' : 'post';

    async function loadStruct<T extends Comment | Post> (struct: T) {
      const result = await api.query.blogs[`${structQuery}ById`](id) as Option<T>;

      if (result.isNone) return;

      const _struct = result.unwrap();
      setState(_struct);
    }
    loadStruct(state).catch(err => console.log(err));

    // TODO not use callback
    api.query.blogs[`${structQuery}ReactionIdByAccount`](dataForQuery, reactionId => {
      api.query.blogs.reactionById(reactionId, x => {
        if (x.isNone) {
          setReactionState(undefined);
          return;
        }
        const reaction = x.unwrap() as Reaction;
        setReactionState(reaction);
        setReactionKind(reaction.kind.toString());
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));

  }, [ reactionKind ]);

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

    const calcVotingPercentage = () => {
      const { upvotes_count, downvotes_count } = state;
      const totalCount = upvotes_count.add(downvotes_count);
      console.log([upvotes_count.toNumber(), downvotes_count.toNumber()]);
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

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    const renderTxButton = (isUpvote: boolean) => {

      const reactionName = isUpvote ? 'Upvote' : 'Downvote';
      const color = isUpvote ? 'green' : 'red';
      const isActive = (reactionKind === reactionName) && 'active';
      const icon = isUpvote ? '' : 'dis';
      const struct = isComment ? 'Comment' : 'Post';

      return (<TxButton
        type='submit'
        compact
        className={`${color} ${isActive}`}
        params={buildTxParams(reactionName)}
        tx={reactionState === undefined
          ? `blogs.create${struct}Reaction`
          : (reactionKind !== `${reactionName}`)
          ? `blogs.update${struct}Reaction`
          : `blogs.delete${struct}Reaction`}
      >
        <Icon type={`${icon}like`} twoToneColor='#F14F4F'/>
      </TxButton>);
    };

    const count = calcVotingPercentage();
    console.log(count);

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

  return VoterRender();
};
