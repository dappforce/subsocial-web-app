import React, { useState } from 'react';

import { PostVoters } from '../../voting/ListVoters';
import { CommentSection } from '../../comments/CommentsSection';
import { PostCreator, PostDropDownMenu, PostActionsPanel, SharePostContent } from './helpers';
import { InnerPreviewProps } from '.';

export const SharedPreview: React.FunctionComponent<InnerPreviewProps> = ({ postDetails, space, withActions, replies }) => {
  if (!postDetails.ext) return null;
  const { post: { struct: originalPost, content: originalContent } } = postDetails.ext;

  if (!originalPost || !originalContent) return null;
  const [ postVotersOpen, setPostVotersOpen ] = useState(false);
  const [ commentsSection, setCommentsSection ] = useState(false)

  const { struct } = postDetails.post
  return <>
    <div className='DfRow'>
      <PostCreator postDetails={postDetails} space={space} withSpaceName />
      <PostDropDownMenu account={struct.created.account} space={space.struct} post={struct}/>
    </div>
    <SharePostContent postDetails={postDetails} space={space} />
    {withActions && <PostActionsPanel postDetails={postDetails} toogleCommentSection={() => setCommentsSection(!commentsSection)} preview />}
    {commentsSection && <CommentSection post={postDetails} space={space.struct} replies={replies}/>}
    {postVotersOpen && <PostVoters id={struct.id} active={0} open={postVotersOpen} close={() => setPostVotersOpen(false)}/>}
  </>;
};
