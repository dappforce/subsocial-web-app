import React from 'react'
import { RegularPreview, SharedPreview, HiddenPostAlert } from '.'
import { PostWithSomeDetails, PostWithAllDetails, SpaceData } from 'src/types'
import { Segment } from 'src/components/utils/Segment'

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
  const { postDetails, space: externalSpace } = props
  const { space: globalSpace, post: { struct } } = postDetails
  const { isSharedPost } = struct
  const space = externalSpace || globalSpace

  if (!space) return null

  return <Segment className='DfPostPreview'>
    <HiddenPostAlert post={struct} preview />
    {isSharedPost
      ? <SharedPreview space={space} {...props} />
      : <RegularPreview space={space} {...props} />
    }
  </Segment>
}

export default PostPreview