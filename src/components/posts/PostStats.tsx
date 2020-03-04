import React, { useState } from 'react';
import { Option } from '@polkadot/types';

import { PostId, Post } from '@subsocial/types/interfaces/runtime';
import { MutedSpan } from '../utils/MutedText';
import { PostVoters, ActiveVoters } from '../voting/ListVoters';
import { Pluralize } from '../utils/Plularize';
import BN from 'bn.js';
import { withCalls, withMulti } from '@polkadot/react-api';
import { queryBlogsToProp } from '../utils';

type StatsProps = {
  id: PostId
  postById?: Option<Post>
};

const InnerStatsPanel = (props: StatsProps) => {
  const { postById } = props;

  const [ commentsSection, setCommentsSection ] = useState(false);
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ activeVoters, setActiveVoters ] = useState(0);

  const openVoters = (type: ActiveVoters) => {
    setPostVotersOpen(true);
    setActiveVoters(type);
  };

  if (!postById || postById.isNone) return null;
  const post = postById.unwrap();

  const { upvotes_count, downvotes_count, comments_count, shares_count, score, id } = post;
  const reactionsCount = new BN(upvotes_count).add(new BN(downvotes_count));

  return (<>
    <div className='DfCountsPreview'>
      {<MutedSpan><div onClick={() => reactionsCount && openVoters(ActiveVoters.All)} className={reactionsCount ? '' : 'disable'}><Pluralize count={reactionsCount} singularText='Reaction' /></div></MutedSpan>}
      <MutedSpan><div onClick={() => setCommentsSection(!commentsSection)}>
        <Pluralize count={comments_count} singularText='Comment' /></div></MutedSpan>
      <MutedSpan><div><Pluralize count={shares_count} singularText='Share' /></div></MutedSpan>
      <MutedSpan><Pluralize count={score} singularText='Point' /></MutedSpan>
    </div>
    {postVotersOpen && <PostVoters id={id} active={activeVoters} open={postVotersOpen} close={() => setPostVotersOpen(false)} />}
  </>);
};

export default withMulti<StatsProps>(
  InnerStatsPanel,
  withCalls(
    queryBlogsToProp('postById', 'id')
  )
);
