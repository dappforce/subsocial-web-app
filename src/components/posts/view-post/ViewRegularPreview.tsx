import React, { FC, useState } from 'react'
import { SpaceData } from 'src/types'
import { CommentSection } from '../../comments/CommentsSection'
import { InfoPostPreview, PostActionsPanel, PostNotFound } from './helpers'
import { PreviewProps } from './PostPreview'
import { isVisible } from 'src/components/utils'

export type InnerPreviewProps = PreviewProps & {
  space: SpaceData
}

type ComponentType = FC<InnerPreviewProps>

/** Sloooooooow Regular Preview */
export const RegularPreview: ComponentType = (props) => {
  const { postDetails, space, replies, withImage, withTags, withActions } = props
  const [ commentsSection, setCommentsSection ] = useState(false)
  const extStruct = postDetails.ext?.post.struct

  return !extStruct || isVisible({ struct: extStruct, address: extStruct.ownerId })
    ? <>
      <InfoPostPreview postDetails={postDetails} space={space} withImage={withImage} withTags={withTags} />
      {withActions && <PostActionsPanel postDetails={postDetails} space={space.struct} toogleCommentSection={() => setCommentsSection(!commentsSection) } preview withBorder />}
      {commentsSection && <CommentSection post={postDetails} replies={replies} space={space.struct} withBorder />}
    </>
    : <PostNotFound />
}
