import React, { useState, useEffect } from 'react';
import { newLogger } from '@subsocial/utils';
import { PostWithAllDetails, BlogData } from '@subsocial/types/dto';
import { useSubsocialApi } from '../../utils/SubsocialApiContext';
import { RegularPreview, InnerPreviewProps } from './ViewRegularPreview';
import { isRegularPost } from './helpers';
import { SharedPreview } from './ViewSharedPreview';
import { BarePreviewProps } from './PostPreview';
import { AnyPostId } from '@subsocial/types';
const log = newLogger('View Post')

export type DynamicPreviewProps = BarePreviewProps & {
  id: AnyPostId
}

export function DynamicPostPreview ({ id, withActions, replies, asRegularPost }: DynamicPreviewProps) {
  const [ postStruct, setPostStruct ] = useState<PostWithAllDetails>();
  const { subsocial } = useSubsocialApi()

  useEffect(() => {
    let isSubscribe = true;
    const loadPost = async () => {
      const extPostData = id && await subsocial.findPostWithAllDetails(id)
      if (isSubscribe && extPostData) {
        const extension = extPostData.post.struct.extension
        if (extension.isComment) {
          const rootPostData = await subsocial.findPostWithAllDetails(extension.asComment.root_post_id)
          extPostData.blog = rootPostData?.blog || {} as BlogData
        }
        setPostStruct(extPostData)
      }
    };

    loadPost().catch(err => log.error('Failed to load post data:', err));

    return () => { isSubscribe = false; };
  }, [ false ]);

  if (!postStruct) return null;

  const props = {
    postStruct: postStruct,
    blog: postStruct.blog,
    withActions: withActions,
    replies: replies
  } as InnerPreviewProps

  return asRegularPost || isRegularPost(postStruct.post.struct.extension)
    ? <RegularPreview {...props} />
    : <SharedPreview {...props} />
}
