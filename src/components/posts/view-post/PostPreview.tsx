import React from 'react';
import { RegularPreview, SharedPreview, isRegularPost, HiddenPostAlert } from '.';
import { PostWithAllDetails, SpaceData } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { Segment } from 'src/components/utils/Segment';
export type BarePreviewProps = {
  withActions?: boolean,
  replies?: PostWithAllDetails[],
  asRegularPost?: boolean
}

export type PreviewProps = BarePreviewProps & {
  postDetails: PostWithAllDetails,
  space?: SpaceData
}

export function PostPreview (props: PreviewProps) {
  const { postDetails, space: externalSpace, asRegularPost } = props
  const { space, post: { struct: { extension } } } = postDetails
  return <Segment className='DfPostPreview'>
    <HiddenPostAlert post={postDetails} />
    {asRegularPost || isRegularPost(extension as PostExtension)
      ? <RegularPreview space={externalSpace || space} {...props} />
      : <SharedPreview space={externalSpace || space} {...props} />}
  </Segment>
}

export default PostPreview
