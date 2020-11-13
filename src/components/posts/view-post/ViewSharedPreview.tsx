import React, { useState } from 'react';
import { CommentSection } from '../../comments/CommentsSection';
import { PostCreator, PostDropDownMenu, PostActionsPanel, SharePostContent } from './helpers';
import { InnerPreviewProps } from '.';

type ComponentType = React.FunctionComponent<InnerPreviewProps>

export const SharedPreview: ComponentType = (props) => {
  const { postDetails, space, withActions, replies } = props
  const [ commentsSection, setCommentsSection ] = useState(false)

  return <>
    <div className='DfRow'>
      <PostCreator postDetails={postDetails} space={space} withSpaceName />
      <PostDropDownMenu space={space.struct} post={postDetails.post}/>
    </div>
    <SharePostContent postDetails={postDetails} space={space} />
    {withActions && <PostActionsPanel postDetails={postDetails} space={space.struct} toogleCommentSection={() => setCommentsSection(!commentsSection)} preview />}
    {commentsSection && <CommentSection post={postDetails} space={space.struct} replies={replies} withBorder/>}
  </>
}
