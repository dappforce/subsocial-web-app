import React, { useState } from 'react';
import { withCalls, withMulti } from '../substrate';
import { reactionsQueryToProp, Loading } from '../utils/index';
import { Modal, Button, Tabs } from 'antd';
import { ReactionId, Reaction, PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { Pluralize } from '../utils/Plularize';
import partition from 'lodash.partition';
import { MutedDiv } from '../utils/MutedText';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { newLogger, nonEmptyArr, isEmptyArray } from '@subsocial/utils';
import { AuthorPreviewWithOwner } from '../profiles/address-views';
const { TabPane } = Tabs;
const log = newLogger('List voters')

type VotersProps = {
  id: PostId,
  reactionIds?: ReactionId[],
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

const renderVoters = (state: Array<Reaction>) => {
  return state.map(reaction => {
    return <div key={reaction.id.toString()} className="ReactionsItem" >
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

type TabPaneType = {
  title: string,
  key: string,
  voters: Array<Reaction>
}

const renderTitle = (title: string, voters: Array<Reaction>) => nonEmptyArr(voters) ? `${title} (${voters.length})` : title

const InnerModalVoters = (props: VotersProps) => {
  const { reactionIds, open, close, active = ActiveVoters.All } = props;
  const votersCount = reactionIds ? reactionIds.length : 0;
  const [ reactionView, setReactionView ] = useState<Array<Reaction>>();
  const [ trigger, setTrigger ] = useState(false);
  const [ upvoters, downvoters ] = partition(reactionView, (x) => isUpvote(x))

  const toggleTrigger = () => {
    reactionIds === undefined && setTrigger(!trigger);
  };

  useSubsocialEffect(({ substrate }) => {
    if (!reactionIds) return toggleTrigger();

    let isSubscribe = true;

    const loadVoters = async () => {
      const loadedReaction = await substrate.findReactions(reactionIds)
      isSubscribe && setReactionView(loadedReaction);
    };
    loadVoters().catch(err => log.error('Failed to load voters:', err));

    return () => { isSubscribe = false; };
  }, [ trigger ]);

  const renderContent = () => {
    if (!reactionView) return <Loading />;

    const panes: TabPaneType[] = [
      { key: 'all', title: 'All', voters: reactionView },
      { key: 'upvote', title: 'Upvoters', voters: upvoters },
      { key: 'downvote', title: 'Downvoters', voters: downvoters }
    ];

    if (isEmptyArray(reactionView)) return <MutedDiv className='DfNoVoters'><em>No reactions yet</em></MutedDiv>

    return <Tabs defaultActiveKey={active.toString()}>
      {panes.map(({ key, title, voters }) => <TabPane
        key={key}
        tab={renderTitle(title, voters)}
        disabled={isEmptyArray(voters)}
      >
        {renderVoters(voters)}
      </TabPane>)}
    </Tabs>
  }

  return (
    <Modal
      onCancel={close}
      visible={open}
      title={<Pluralize count={votersCount} singularText='Reaction'/>}
      footer={<Button onClick={close}>Close</Button>}
      style={{ marginTop: '3rem' }}
    >
      {renderContent()}
    </Modal>
  );
};

export const PostVoters = withMulti(
  InnerModalVoters,
  withCalls<VotersProps>(
    reactionsQueryToProp(`reactionIdsByPostId`, { paramName: 'id', propName: 'reactionIds' })
  )
);

export const CommentVoters = withMulti(
  InnerModalVoters,
  withCalls<VotersProps>(
    reactionsQueryToProp(`reactionIdsByCommentId`, { paramName: 'id', propName: 'reactionIds' })
  )
);
