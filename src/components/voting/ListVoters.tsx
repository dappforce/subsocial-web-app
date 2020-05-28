import React, { useState, useEffect } from 'react';
import { withCalls, withMulti } from '@subsocial/react-api';
import { socialQueryToProp } from '../utils/index';
import { Modal, Button, Tab, Menu } from 'semantic-ui-react';
import { ReactionId, Reaction, PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { Pluralize } from '../utils/Plularize';
import partition from 'lodash.partition';
import { MutedDiv, MutedSpan } from '../utils/MutedText';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { newLogger } from '@subsocial/utils';
import { AuthorPreviewWithOwner } from '../profiles/address-views';

const log = newLogger('List voters')

type VotersProps = {
  id: PostId,
  reactions?: ReactionId[],
  active?: number
  open: boolean,
  close: () => void
};

export enum ActiveVoters {
  All = 0,
  Upvote,
  Downvote
}// TODO fix activeIndex lock

function isUpvote (reaction: Reaction): boolean {
  return reaction && reaction.kind.toString() === 'Upvote'
}

const InnerModalVoters = (props: VotersProps) => {
  const { reactions, open, close, active = ActiveVoters.All } = props;
  const votersCount = reactions ? reactions.length : 0;
  const { substrate } = useSubsocialApi()
  const [ reactionView, setReactionView ] = useState(undefined as (Array<Reaction> | undefined));
  const [ trigger, setTrigger ] = useState(false);
  const [ upvoters, downvoters ] = partition(reactionView, (x) => isUpvote(x))

  const toggleTrigger = () => {
    reactions === undefined && setTrigger(!trigger);
  };

  useEffect(() => {
    if (!open) return toggleTrigger();

    let isSubscribe = true;

    const loadVoters = async () => {
      if (!reactions) return toggleTrigger();

      const loadedReaction = await substrate.findReactions(reactions)
      isSubscribe && setReactionView(loadedReaction);
    };
    loadVoters().catch(err => log.error('Failed to load voters:', err));

    return () => { isSubscribe = false; };
  }, [ trigger ]);

  if (!reactionView) return null;

  const renderVoters = (state: Array<Reaction>) => {
    return state.map(reaction => {
      return <div key={reaction.id.toNumber()} className="ReactionsItem" >
        <AuthorPreviewWithOwner
          address={reaction.created.account}
          isPadded={false}
          isShort={false}
          size={28}
          details={isUpvote(reaction)
            ? <span style={{ color: 'green' }}>Upvoted</span>
            : <span style={{ color: 'red' }}>Downvoted</span>
          }
          withFollowButton
        />
      </div>;
    });
  };

  const TabContent = (voters: Array<Reaction>) => {
    return voters && voters.length
      ? <Tab.Pane>{renderVoters(voters)}</Tab.Pane>
      : <MutedDiv className='DfNoVoters'><em>No reactions yet</em></MutedDiv>
  }

  const TabTitle = (title: string, voters: Array<Reaction>) => {
    return <Menu.Item>{title}<MutedSpan style={{ marginLeft: '.5rem' }}>({voters.length})</MutedSpan></Menu.Item>
  }

  const panes = [
    { key: 'all', menuItem: TabTitle('All', reactionView), render: () => TabContent(reactionView) },
    { key: 'upvote', menuItem: TabTitle('Upvoters', upvoters), render: () => TabContent(upvoters) },
    { key: 'downvote', menuItem: TabTitle('Downvoters', downvoters), render: () => TabContent(downvoters) }
  ];

  return (
    <Modal
      size='small'
      onClose={close}
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><Pluralize count={votersCount} singularText='Reaction'/></Modal.Header>
      <Modal.Content scrolling>
        <Tab panes={panes} defaultActiveIndex={active}/>
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const PostVoters = withMulti(
  InnerModalVoters,
  withCalls<VotersProps>(
    socialQueryToProp(`reactionIdsByPostId`, { paramName: 'id', propName: 'reactions' })
  )
);

export const CommentVoters = withMulti(
  InnerModalVoters,
  withCalls<VotersProps>(
    socialQueryToProp(`reactionIdsByCommentId`, { paramName: 'id', propName: 'reactions' })
  )
);
