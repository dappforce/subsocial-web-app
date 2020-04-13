import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import ViewPostPage, { loadExtPost, loadPostData, PostData } from '../posts/ViewPost';
import { getApi } from '../utils/SubstrateApi';
import { Loading } from '../utils/utils';

type Props = {
  postId: BN
}

export function PostPreview (props: Props) {
  const { postId } = props;
  const [ data, setData ] = useState<PostData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const api = await getApi();
      const postData = await loadPostData(api, postId);
      const postExtData = postData.post ? await loadExtPost(api, postData.post) : {} as PostData;
      setData([ postData, postExtData ]);
    };

    loadData().catch(console.log);
  }, [ false ]);

  return data.length > 0
    ? <ViewPostPage postData={data[0]} postExtData={data[1]} variant='preview' withBlogName />
    : <Loading />;
}

export default PostPreview
