import React, { useState } from 'react';
import { CommentSection } from '../../comments/CommentsSection';
import { PostCreator, PostDropDownMenu, PostActionsPanel, SharePostContent } from './helpers';
import { InnerPreviewProps } from '.';

export const SharedPreview: React.FunctionComponent<InnerPreviewProps> = ({ postDetails, space, withActions, replies }) => {
  const [ commentsSection, setCommentsSection ] = useState(false)

  const { struct } = postDetails.post
  return <>
    <div className='DfRow'>
      <PostCreator postDetails={postDetails} space={space} withSpaceName />
      <PostDropDownMenu space={space.struct} post={struct}/>
    </div>
    <SharePostContent postDetails={postDetails} space={space} />
    {withActions && <PostActionsPanel postDetails={postDetails} space={space.struct} toogleCommentSection={() => setCommentsSection(!commentsSection)} preview />}
    {commentsSection && <CommentSection post={postDetails} space={space.struct} replies={replies} withBorder/>}
  </>;
};
