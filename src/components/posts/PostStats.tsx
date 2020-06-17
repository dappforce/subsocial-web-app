import React, { useState } from 'react';
import { Option } from '@polkadot/types';
import { PostId, Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { MutedSpan } from '../utils/MutedText';
import { PostVoters, ActiveVoters } from '../voting/ListVoters';
import { Pluralize } from '../utils/Plularize';
import BN from 'bn.js';
import { withCalls, withMulti } from '@subsocial/react-api';
import { postsQueryToProp } from '../utils';
import { nonEmptyStr } from '@subsocial/utils';

type StatsProps = {
  id: PostId
  postById?: Option<Post>
  goToCommentsId?: string
};

const InnerStatsPanel = (props: StatsProps) => {
  const { postById, goToCommentsId } = props;

  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ activeVoters, setActiveVoters ] = useState(0);

  const openVoters = (type: ActiveVoters) => {
    setPostVotersOpen(true);
    setActiveVoters(type);
  };

  if (!postById || postById.isNone) return null;
  const post = postById.unwrap();

  const { upvotes_count, downvotes_count, total_replies_count, shares_count, score, id } = post;
  const reactionsCount = new BN(upvotes_count).add(new BN(downvotes_count));
  const showReactionsModal = () => reactionsCount && openVoters(ActiveVoters.All)

  const toggleCommentsSection = goToCommentsId ? undefined : () => setCommentsSection(!commentsSection)
  const comments = <Pluralize count={total_replies_count} singularText='Comment' />

  return <>
    <div className='DfCountsPreview'>
      <MutedSpan className={reactionsCount ? '' : 'disable'}>
        <span className='DfBlackLink' onClick={showReactionsModal}>
          <Pluralize count={reactionsCount} singularText='Reaction' />
        </span>
      </MutedSpan>
      <MutedSpan>
        {nonEmptyStr(goToCommentsId)
          ? <a className='DfBlackLink' href={'#' + goToCommentsId}>{comments}</a>
          : <span onClick={toggleCommentsSection}>{comments}</span>
        }
      </MutedSpan>
      <MutedSpan><Pluralize count={shares_count} singularText='Share' /></MutedSpan>
      <MutedSpan><Pluralize count={score} singularText='Point' /></MutedSpan>
    </div>
    {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)} />}
  </>;
};

export default withMulti<StatsProps>(
  InnerStatsPanel,
  withCalls(
    postsQueryToProp('postById', 'id')
  )
);
