import React, { useState } from 'react';
import { Segment } from 'semantic-ui-react';
import { SpaceData } from '@subsocial/types/dto';
import { CommentSection } from '../../comments/CommentsSection';
import { InfoPostPreview, PostActionsPanel } from './helpers';
import { PreviewProps } from './PostPreview';

export type InnerPreviewProps = PreviewProps & {
  space: SpaceData
}

export const RegularPreview: React.FunctionComponent<InnerPreviewProps> = ({ postStruct, space, replies, withActions = false }) => {
  const [ commentsSection, setCommentsSection ] = useState(false)
  return <>
    <Segment className='DfPostPreview'>
      <InfoPostPreview postStruct={postStruct} space={space} />
      {withActions && <PostActionsPanel postStruct={postStruct} toogleCommentSection={() => setCommentsSection(!commentsSection) } />}
      {commentsSection && <CommentSection post={postStruct.post.struct} replies={replies} space={space.struct} />}
    </Segment>
  </>;
}
