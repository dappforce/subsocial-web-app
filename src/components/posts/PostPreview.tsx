import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import ViewPostPage from '../posts/ViewPost';
import { Loading } from '../utils/utils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { loadSharedPostExt, PostDataListItem } from './LoadPostUtils';
import { PostData } from '@subsocial/types';

type Props = {
  postId: BN
}

export function PostPreview (props: Props) {
  const { postId } = props;
  const [ data, setData ] = useState<PostDataListItem>({ postData: {} as PostData });
  const [ loaded, setLoaded ] = useState(false)
  const { subsocial } = useSubsocialApi()

  useEffect(() => {
    const loadData = async () => {
      const postData = await subsocial.findPost(postId)
      if (postData) {
        const postExtData = await loadSharedPostExt(postData)
        setData({ postData, postExtData });
      }
      setLoaded(true)
    };

    loadData().catch(console.log);
  }, [ false ]);

  return loaded
    ? <ViewPostPage postData={data.postData} postExtData={data?.postExtData} variant='preview' withBlogName />
    : <Loading />;
}

export default PostPreview
