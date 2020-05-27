import React, { useState } from 'react';
import { Segment } from 'semantic-ui-react';
import { PostWithAllDetails, BlogData } from '@subsocial/types/dto';
import { CommentSection } from '../CommentsSection';
import { InfoPostPreview, PostActionsPanel } from './helpers';
import { withLoadedData } from './withLoadedPostData';

export type RegularPreviewProps = {
  postStruct: PostWithAllDetails,
  blog: BlogData,
  withActions?: boolean,
  replies?: PostWithAllDetails[]
}

export const RegularPreview: React.FunctionComponent<RegularPreviewProps> = ({ postStruct, blog, replies, withActions = false }) => {
  const [ commentsSection, setCommentsSection ] = useState(false)
  return <>
    <Segment className='DfPostPreview'>
      <InfoPostPreview postStruct={postStruct} blog={blog} />
      {withActions && <PostActionsPanel postStruct={postStruct} toogleCommentSection={() => setCommentsSection(!commentsSection) } />}
      {commentsSection && <CommentSection post={postStruct.post.struct} replies={replies} blog={blog.struct} />}
    </Segment>
  </>;
}

export const DynamicRegularPreview = withLoadedData(RegularPreview)
