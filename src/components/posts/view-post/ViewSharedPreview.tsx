import React, { useState } from 'react';

import { Segment } from 'src/components/utils/Segment';

import { PostVoters } from '../../voting/ListVoters';
import SummarizeMd from '../../utils/md/SummarizeMd';
import { CommentSection } from '../../comments/CommentsSection';
import { PostCreator, PostDropDownMenu, renderPostLink, PostActionsPanel, PostNotFound } from './helpers';
import { InnerPreviewProps, RegularPreview } from '.';
import { PostWithAllDetails } from '@subsocial/types';
import { isVisible } from 'src/components/utils';

export const SharedPreview: React.FunctionComponent<InnerPreviewProps> = ({ postStruct, space, withActions, replies }) => {
  if (!postStruct.ext) return null;
  const { post: { struct: originalPost, content: originalContent } } = postStruct.ext;

  if (!originalPost || !originalContent) return null;
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ commentsSection, setCommentsSection ] = useState(false)

  const { struct, content } = postStruct.post
  return <>
    <div className='DfRow'>
      <PostCreator postStruct={postStruct} space={space} withSpaceName />
      <PostDropDownMenu account={struct.created.account} space={space.struct} post={struct}/>
    </div>
    <div className='DfSharedSummary'>
      <SummarizeMd md={content?.body} more={renderPostLink(space.struct, originalPost, 'See More')} />
    </div>
    <Segment className='DfPostPreview'>
      {isVisible({ struct: originalPost, address: originalPost.created.account })
        ? <RegularPreview postStruct={postStruct.ext as PostWithAllDetails} space={space} />
        : <PostNotFound />}
    </Segment>
    {withActions && <PostActionsPanel postStruct={postStruct.ext} toogleCommentSection={() => setCommentsSection(!commentsSection)} preview />}
    {commentsSection && <CommentSection post={postStruct} space={space.struct} replies={replies}/>}
    {postVotersOpen && <PostVoters id={struct.id} active={0} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
  </>;
};
