import React from 'react';
import { RegularPreview, SharedPreview, isRegularPost } from '../posts/view-post';
import { PostWithAllDetails } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';

type PostPreviewProps = {
  post: PostWithAllDetails
}

export function PostPreview (props: PostPreviewProps) {
  const { post } = props
  const { blog, post: { struct: { extension } } } = post
  return isRegularPost(extension as PostExtension)
    ? <RegularPreview postStruct={post} blog={blog} withActions />
    : <SharedPreview postStruct={post} blog={blog} withActions withStats />
}

export default PostPreview
