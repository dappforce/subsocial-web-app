import React, { useState } from 'react';
import { newLogger } from '@subsocial/utils';
import { PostWithAllDetails, SpaceData } from '@subsocial/types/dto';
import useSubsocialEffect from 'src/components/api/useSubsocialEffect';
import { InnerPreviewProps } from './ViewRegularPreview';
import PostPreview, { BarePreviewProps } from './PostPreview';
import { AnyPostId } from '@subsocial/types';

const log = newLogger(DynamicPostPreview.name)

export type DynamicPreviewProps = BarePreviewProps & {
  id: AnyPostId
}

export function DynamicPostPreview ({ id, withActions, replies, asRegularPost }: DynamicPreviewProps) {
  const [ postStruct, setPostStruct ] = useState<PostWithAllDetails>()

  useSubsocialEffect(({ subsocial }) => {
    let isSubscribe = true

    const loadPost = async () => {
      const extPostData = id && await subsocial.findPostWithAllDetails({ id })
      if (isSubscribe && extPostData) {
        const extension = extPostData.post.struct.extension
        if (extension.isComment) {
          const rootPostId = extension.asComment.root_post_id
          const rootPostData = await subsocial.findPostWithAllDetails({ id: rootPostId })
          extPostData.space = rootPostData?.space || {} as SpaceData
        }
        setPostStruct(extPostData)
      }
    }

    loadPost().catch(err => log.error(`Failed to load post data. ${err}`))

    return () => { isSubscribe = false }
  }, [ false ])

  if (!postStruct) return null

  const props = {
    postStruct: postStruct,
    space: postStruct.space,
    withActions: withActions,
    replies: replies,
    asRegularPost: asRegularPost
  } as InnerPreviewProps

  return <PostPreview {...props} />
}
