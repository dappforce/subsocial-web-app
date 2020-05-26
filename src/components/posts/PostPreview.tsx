import React from 'react';
import ViewPostPage from '../posts/ViewPost';
import { PostWithAllDetails } from '@subsocial/types';

type PostPreviewProps = {
  post: PostWithAllDetails
}

export function PostPreview (props: PostPreviewProps) {
  return <ViewPostPage postStruct={props.post} variant='preview' withBlogName />
}

export default PostPreview
