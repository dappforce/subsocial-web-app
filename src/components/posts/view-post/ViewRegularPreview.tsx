import React, { useState } from 'react';
import { Segment } from 'semantic-ui-react';
import { SpaceData } from '@subsocial/types/dto';
import { CommentSection } from '../../comments/CommentsSection';
import { InfoPostPreview, PostActionsPanel, HiddenPostAlert } from './helpers';
import { PreviewProps } from './PostPreview';

export type InnerPreviewProps = PreviewProps & {
  space: SpaceData
}

export const RegularPreview: React.FunctionComponent<InnerPreviewProps> = ({ postStruct, space, replies, withActions = false }) => {
  const [ commentsSection, setCommentsSection ] = useState(false)
  const struct = postStruct.post.struct
  return <>
    <Segment className='DfPostPreview'>
      <HiddenPostAlert post={struct} space={space?.struct} />
      <InfoPostPreview postStruct={postStruct} space={space} />
      {withActions && <PostActionsPanel postStruct={postStruct} toogleCommentSection={() => setCommentsSection(!commentsSection) } />}
      {commentsSection && <CommentSection post={struct} replies={replies} space={space.struct} />}
    </Segment>
  </>;
}
