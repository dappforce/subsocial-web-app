import React from 'react';
import { RegularPreview, SharedPreview, isRegularPost } from '.';
import { PostWithAllDetails, SpaceData } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';

export type BarePreviewProps = {
  withActions?: boolean,
  replies?: PostWithAllDetails[],
  asRegularPost?: boolean
}

export type PreviewProps = BarePreviewProps & {
  postStruct: PostWithAllDetails,
  space?: SpaceData
}

export function PostPreview ({ postStruct, space: externalSpace, asRegularPost }: PreviewProps) {
  const { space, post: { struct: { extension } } } = postStruct
  return asRegularPost || isRegularPost(extension as PostExtension)
    ? <RegularPreview postStruct={postStruct} space={externalSpace || space} withActions />
    : <SharedPreview postStruct={postStruct} space={externalSpace || space} withActions />
}

export default PostPreview
