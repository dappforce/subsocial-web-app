import React from 'react';
import { RegularPreview, SharedPreview, isRegularPost } from '.';
import { PostWithAllDetails, BlogData } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';

export type BarePreviewProps = {
  withActions?: boolean,
  replies?: PostWithAllDetails[]
}

export type PreviewProps = BarePreviewProps & {
  postStruct: PostWithAllDetails,
  blog?: BlogData
}

export function PostPreview (props: PreviewProps) {
  const { postStruct, blog: externalBlog } = props
  const { blog, post: { struct: { extension } } } = postStruct
  return isRegularPost(extension as PostExtension)
    ? <RegularPreview postStruct={postStruct} blog={externalBlog || blog} withActions />
    : <SharedPreview postStruct={postStruct} blog={externalBlog || blog} withActions />
}

export default PostPreview
