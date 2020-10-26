import React from 'react';
import { RegularPreview, SharedPreview, HiddenPostAlert } from '.';
import { PostWithSomeDetails, PostWithAllDetails, SpaceData } from '@subsocial/types';
import { PostExtension } from '@subsocial/types/substrate/classes';
import { Segment } from 'src/components/utils/Segment';
import { isSharedPost, withSubscribedPost } from './helpers';

export type BarePreviewProps = {
  withTags?: boolean,
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
  const { space: globalSpace, post: { struct } } = postDetails
  const { extension } = struct
  const space = externalSpace || globalSpace

  if (!space) return null

  return <Segment className='DfPostPreview'>
    <HiddenPostAlert post={struct} space={space} preview />
    {asRegularPost || !isSharedPost(extension as PostExtension)
      ? <RegularPreview space={space} {...props} />
      : <SharedPreview space={space} {...props} />}
  </Segment>
}

export default withSubscribedPost(PostPreview)
