import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';

import TxButton from '../utils/TxButton';
import { api } from '@polkadot/ui-api';
import { AccountId, Option } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '../utils/MyAccountContext';
import { CommentVoters, PostVoters } from './ListVoters';
import { Post, Reaction, CommentId, PostId, ReactionKind, Comment } from '../types';

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

    let colorCount = '';

    const calcUpvotesPercentage = () => {
      const upvotes = state.upvotes_count.toNumber();
      const downvotes = state.downvotes_count.toNumber();
      const count = upvotes + downvotes;

      const calcPercentage = () => {
        const res = upvotes / count * 100;
        if (res === 0) {
          return '0%';
        }

        return (res).toString() + '%';
      };

      if (count === 0) {
        colorCount = '';
        return '0';
      } else if (upvotes >= downvotes) {
        colorCount = 'green';
        return calcPercentage();
      } else {
        colorCount = 'red';
        return calcPercentage();
      }
    };

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    const renderTxButton = (isUpvote: boolean) => {

      const reactionName = isUpvote ? 'Upvote' : 'Downvote';
      const color = isUpvote ? 'green' : 'red';
      const isActive = (reactionKind === reactionName) && 'active';
      const icon = isUpvote ? 'up' : 'down';
      const struct = isComment ? 'Comment' : 'Post';

      return (<TxButton
        type='submit'
        compact
        icon={`thumbs ${icon} outline`}
        className={`${color} ${isActive}`}
        params={buildTxParams(reactionName)}
        tx={reactionState === undefined
          ? `blogs.create${struct}Reaction`
          : (reactionKind !== `${reactionName}`)
          ? `blogs.update${struct}Reaction`
          : `blogs.delete${struct}Reaction`}
      />);
    };

    return <>
      <Button.Group className={`DfVoter`}>
        {renderTxButton(true)}
        <Button content={calcUpvotesPercentage()} variant='primary' className={`${colorCount} active`} onClick={() => setOpen(true)}/>
        {renderTxButton(false)}
      </Button.Group>
      {isComment
      ? open && <CommentVoters id={id} open={open} close={close}/>
      : open && <PostVoters id={id} open={open} close={close}/>}
    </>;
  };

  return VoterRender();
};
