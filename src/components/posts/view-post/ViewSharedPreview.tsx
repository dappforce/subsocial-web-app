import React, { useState } from 'react';
import dynamic from 'next/dynamic';

import { Segment } from 'semantic-ui-react';

import { PostVoters } from '../../voting/ListVoters';
import SummarizeMd from '../../utils/md/SummarizeMd';
import { CommentSection } from '../../comments/CommentsSection';
import { PostCreator, PostDropDownMenu, renderPostLink, InfoPostPreview, PostActionsPanel, HiddenPostAlert } from './helpers';
import { InnerPreviewProps } from '.';

const StatsPanel = dynamic(() => import('../PostStats'), { ssr: false });

export const SharedPreview: React.FunctionComponent<InnerPreviewProps> = ({ postStruct, space, withActions, replies }) => {
  if (!postStruct.ext) return null;
  const { post: { struct: originalPost, content: originalContent } } = postStruct.ext;

  if (!originalPost || !originalContent) return null;
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ commentsSection, setCommentsSection ] = useState(false)

  const { struct, content } = postStruct.post
  return <>
    <Segment className='DfPostPreview'>
      <HiddenPostAlert post={struct} space={space?.struct} />
      <div className='DfRow'>
        <PostCreator postStruct={postStruct} space={space} withSpaceName />
        <PostDropDownMenu account={struct.created.account} space={space.struct} post={struct}/>
      </div>
      <div className='DfSharedSummary'>
        <SummarizeMd md={content?.body} more={renderPostLink(space.struct, originalPost, 'See More')} />
      </div>
      <Segment className='DfPostPreview'>
        <InfoPostPreview postStruct={postStruct.ext} space={space} />
        <StatsPanel id={originalPost.id}/>
      </Segment>
      {withActions && <PostActionsPanel postStruct={postStruct.ext} toogleCommentSection={() => setCommentsSection(!commentsSection)} />}
      {commentsSection && <CommentSection post={struct} space={space.struct} replies={replies}/>}
      {postVotersOpen && <PostVoters id={struct.id} active={0} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
    </Segment>
  </>;
};
