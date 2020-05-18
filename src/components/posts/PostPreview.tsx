import React from 'react';
import ViewPostPage from '../posts/ViewPost';
import { Loading } from '../utils/utils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { ExtendedPostData } from '@subsocial/types';
import { Blog } from '@subsocial/types/substrate/interfaces';

type PostPreviewProps = {
  post: ExtendedPostData
}

export function PostPreview (props: PostPreviewProps) {
  const { post, ext, owner, blog = {} as BlogData } = props.post

  return <ViewPostPage postData={post} blog={{} as Blog} postExtData={ext} owner={owner} variant='preview' withBlogName />
}

export default PostPreview
