import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import ViewPostPage from '../posts/ViewPost';
import { Loading } from '../utils/utils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, ExtendedPostData } from '@subsocial/types';

type Props = {
  postId: BN
}

export function PostPreview (props: Props) {
  const { postId } = props;
  const [ data, setData ] = useState<ExtendedPostData>({ post: {} as PostData });
  const [ loaded, setLoaded ] = useState(false)
  const { subsocial } = useSubsocialApi()

  useEffect(() => {
    setLoaded(false)
    const loadData = async () => {
      const extPostData = await subsocial.findPostWithExt(postId)
      extPostData && setData(extPostData)
      setLoaded(true)
    };

    loadData().catch(console.log);
  }, [ false ]);

  return loaded
    ? <ViewPostPage postData={data.post} postExtData={data.ext} variant='preview' withBlogName />
    : <Loading />;
}

export default PostPreview
