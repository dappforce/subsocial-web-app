import React from 'react';
import { RegularPreview, SharedPreview, isRegularPost, HiddenPostAlert } from '.';
import { PostWithAllDetails, SpaceData } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { Segment } from 'semantic-ui-react';
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
  return <Segment className='DfPostPreview'>
    <HiddenPostAlert post={postStruct} />
    {asRegularPost || isRegularPost(extension as PostExtension)
      ? <RegularPreview postStruct={postStruct} space={externalSpace || space} withActions />
      : <SharedPreview postStruct={postStruct} space={externalSpace || space} withActions />}
  </Segment>
}

export default PostPreview
