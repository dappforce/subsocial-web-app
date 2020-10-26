import React, { useState } from 'react';
import { SpaceData } from '@subsocial/types/dto';
import { CommentSection } from '../../comments/CommentsSection';
import { InfoPostPreview, PostActionsPanel, PostNotFound } from './helpers';
import { PreviewProps } from './PostPreview';
import { isVisible } from 'src/components/utils';

export type InnerPreviewProps = PreviewProps & {
  space: SpaceData
}

type ComponentType = React.FunctionComponent<InnerPreviewProps>

export const RegularPreview: ComponentType = (props) => {
  const { postDetails, space, replies, withTags, withActions } = props
  const extStruct = postDetails.ext?.post.struct
  const [ commentsSection, setCommentsSection ] = useState(false)

  return !extStruct || isVisible({ struct: extStruct, address: extStruct.owner })
    ? <>
      <InfoPostPreview postDetails={postDetails} space={space} withTags={withTags} />
      {withActions && <PostActionsPanel postDetails={postDetails} space={space.struct} toogleCommentSection={() => setCommentsSection(!commentsSection) } preview withBorder />}
      {commentsSection && <CommentSection post={postDetails} replies={replies} space={space.struct} withBorder />}
    </>
    : <PostNotFound />
}
