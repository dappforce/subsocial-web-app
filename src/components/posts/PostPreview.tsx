import React from 'react';
import ViewPostPage from '../posts/ViewPost';
import { PostWithAllDetails, BlogData } from '@subsocial/types';

type PostPreviewProps = {
  post: PostWithAllDetails
}

export function PostPreview (props: PostPreviewProps) {
  const { post, ext, owner, blog = {} as BlogData } = props.post

  return <ViewPostPage postData={post} blog={blog.struct} postExtData={ext} owner={owner} variant='preview' withBlogName />
}

export default PostPreview
