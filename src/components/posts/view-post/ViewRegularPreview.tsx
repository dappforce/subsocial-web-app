import React, { useState } from 'react';
import { Segment } from 'semantic-ui-react';
import { BlogData } from '@subsocial/types/dto';
import { CommentSection } from '../CommentsSection';
import { InfoPostPreview, PostActionsPanel } from './helpers';
import { PreviewProps } from './PostPreview';

export type InnerPreviewProps = PreviewProps & {
  blog: BlogData
}

export const RegularPreview: React.FunctionComponent<InnerPreviewProps> = ({ postStruct, blog, replies, withActions = false }) => {
  const [ commentsSection, setCommentsSection ] = useState(false)
  return <>
    <Segment className='DfPostPreview'>
      <InfoPostPreview postStruct={postStruct} blog={blog} />
      {withActions && <PostActionsPanel postStruct={postStruct} toogleCommentSection={() => setCommentsSection(!commentsSection) } />}
      {commentsSection && <CommentSection post={postStruct.post.struct} replies={replies} blog={blog.struct} />}
    </Segment>
  </>;
}
