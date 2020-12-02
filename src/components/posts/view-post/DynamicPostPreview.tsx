import React, { useState } from 'react'
import { newLogger } from '@subsocial/utils'
import { PostWithAllDetails } from 'src/types'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { InnerPreviewProps } from './ViewRegularPreview'
import PostPreview, { BarePreviewProps } from './PostPreview'
import { AnyPostId } from '@subsocial/types'

const log = newLogger(DynamicPostPreview.name)

export type DynamicPreviewProps = BarePreviewProps & {
  id: AnyPostId
}

export function DynamicPostPreview ({ id, withActions, replies, asRegularPost }: DynamicPreviewProps) {
  const [ postDetails, setPostStruct ] = useState<PostWithAllDetails>()

  useSubsocialEffect(({ flatApi }) => {
    let isSubscribe = true

    const loadPost = async () => {
      const extPostData = id && await flatApi.findPostWithAllDetails(id)
      isSubscribe && setPostStruct(extPostData)
    }

    loadPost().catch(err => log.error(`Failed to load post data. ${err}`))

    return () => { isSubscribe = false }
  }, [ false ])

  if (!postDetails) return null

  const props = {
    postDetails: postDetails,
    space: postDetails.space,
    withActions: withActions,
    replies: replies,
    asRegularPost: asRegularPost
  } as InnerPreviewProps

  return <PostPreview {...props} />
}
