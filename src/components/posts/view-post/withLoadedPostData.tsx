import React, { useState, useEffect } from 'react';
import { newLogger } from '@subsocial/utils';
import { Loading } from '../../utils/utils';
import isEmpty from 'lodash.isempty';
import { PostWithAllDetails, BlogData } from '@subsocial/types/dto';
import { useSubsocialApi } from '../../utils/SubsocialApiContext';
import BN from 'bn.js';
import { PostDetailsProps } from './PostPage'
import { RegularPreviewProps } from './ViewRegularPreview';
import { SharedPreviewProps } from './ViewSharedPreview';
const log = newLogger('View Post')

type ExcludeTypes = {
  postStruct?: PostWithAllDetails,
  blog?: BlogData
}

export function withLoadedData <T extends PostDetailsProps | RegularPreviewProps | SharedPreviewProps> (Component: React.ComponentType<T>) {
  return (props: T & ExcludeTypes & { id: BN }) => {
    const { id } = props;
    const [ extPostData, setExtData ] = useState<PostWithAllDetails>();
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
          setExtData(extPostData)
        }
      };

      loadPost().catch(err => log.error('Failed to load post data:', err));

      return () => { isSubscribe = false; };
    }, [ false ]);

    if (isEmpty(extPostData)) return <Loading/>;

    return extPostData
      ? <Component
        {...props as any}
        postStruct={extPostData}
        blog={extPostData.blog}
      />
      : null;
  };
}
