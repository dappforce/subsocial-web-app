import React, { useState } from 'react';
import { SpaceData } from '@subsocial/types/dto';
import { CommentSection } from '../../comments/CommentsSection';
import { InfoPostPreview, PostActionsPanel, PostNotFound } from './helpers';
import { PreviewProps } from './PostPreview';
import { isVisible } from 'src/components/utils';

export type InnerPreviewProps = PreviewProps & {
  space: SpaceData
}

export const RegularPreview: React.FunctionComponent<InnerPreviewProps> = ({ postDetails, space, replies, withActions = false }) => {
  const [ commentsSection, setCommentsSection ] = useState(false)
  const extStruct = postDetails.ext?.post.struct

  return !extStruct || isVisible({ struct: extStruct, address: extStruct.created.account })
    ? <>
      <InfoPostPreview postDetails={postDetails} space={space} />
      {withActions && <PostActionsPanel postDetails={postDetails} toogleCommentSection={() => setCommentsSection(!commentsSection) } preview withBorder />}
      {commentsSection && <CommentSection post={postDetails} replies={replies} space={space.struct} />}
    </>
    : <PostNotFound />
}
