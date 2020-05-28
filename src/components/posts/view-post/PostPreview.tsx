import React from 'react';
import { RegularPreview, SharedPreview, isRegularPost } from '.';
import { PostWithAllDetails, BlogData } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';

export type BarePreviewProps = {
  withActions?: boolean,
  replies?: PostWithAllDetails[],
  asRegularPost?: boolean
}

export type PreviewProps = BarePreviewProps & {
  postStruct: PostWithAllDetails,
  blog?: BlogData
}

export function PostPreview ({ postStruct, blog: externalBlog, asRegularPost }: PreviewProps) {
  const { blog, post: { struct: { extension } } } = postStruct
  return asRegularPost || isRegularPost(extension as PostExtension)
    ? <RegularPreview postStruct={postStruct} blog={externalBlog || blog} withActions />
    : <SharedPreview postStruct={postStruct} blog={externalBlog || blog} withActions />
}

export default PostPreview
