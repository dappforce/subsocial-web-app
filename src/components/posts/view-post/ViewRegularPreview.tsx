import React, { useState } from 'react';
import { SpaceData } from '@subsocial/types/dto';
import { CommentSection } from '../../comments/CommentsSection';
import { InfoPostPreview, PostActionsPanel, PostNotFound } from './helpers';
import { PreviewProps } from './PostPreview';
import { isVisible } from 'src/components/utils';

export type InnerPreviewProps = PreviewProps & {
  space: SpaceData
}

export const RegularPreview: React.FunctionComponent<InnerPreviewProps> = ({ postStruct, space, replies, withActions = false }) => {
  const [ commentsSection, setCommentsSection ] = useState(false)
  const extStruct = postStruct.ext?.post.struct

  return !extStruct || isVisible({ struct: extStruct, address: extStruct.created.account })
    ? <>
      <InfoPostPreview postStruct={postStruct} space={space} />
      {withActions && <PostActionsPanel postStruct={postStruct} toogleCommentSection={() => setCommentsSection(!commentsSection) } preview />}
      {commentsSection && <CommentSection post={postStruct} replies={replies} space={space.struct} />}
    </>
    : <PostNotFound />
}
