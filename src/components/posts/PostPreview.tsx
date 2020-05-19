import React from 'react';
import ViewPostPage from '../posts/ViewPost';
import { ExtendedPostData, BlogData } from '@subsocial/types';

type PostPreviewProps = {
  post: ExtendedPostData
}

export function PostPreview (props: PostPreviewProps) {
  const { post, ext, owner, blog = {} as BlogData } = props.post

  return <ViewPostPage postData={post} blog={blog.struct} postExtData={ext} owner={owner} variant='preview' withBlogName />
}

export default PostPreview
