import React from 'react';
import { RegularPreview, SharedPreview, isRegularPost, HiddenPostAlert } from '.';
import { PostWithSomeDetails, PostWithAllDetails, SpaceData } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { Segment } from 'src/components/utils/Segment';
export type BarePreviewProps = {
  withActions?: boolean,
  replies?: PostWithAllDetails[],
  asRegularPost?: boolean
}

export type PreviewProps = BarePreviewProps & {
  postDetails: PostWithSomeDetails,
  space?: SpaceData
}

export function PostPreview (props: PreviewProps) {
  const { postDetails, space: externalSpace, asRegularPost } = props
  const { space: globalSpace, post: { struct: { extension } } } = postDetails
  const space = externalSpace || globalSpace

  if (!space) return null

  return <Segment className='DfPostPreview'>
    <HiddenPostAlert post={postDetails} />
    {asRegularPost || isRegularPost(extension as PostExtension)
      ? <RegularPreview space={externalSpace || space} {...props} />
      : <SharedPreview space={externalSpace || space} {...props} />}
  </Segment>
}

export default PostPreview
