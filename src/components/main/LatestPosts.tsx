import React from 'react';
import ListData from '../utils/DataList';
import { PostWithAllDetails } from '@subsocial/types';
import PostPreview from '../posts/view-post/PostPreview';

type Props = {
  postsData: PostWithAllDetails[]
}

export const LatestPosts = (props: Props) => {
  const { postsData = [] } = props
  const posts = postsData.filter((x) => typeof x.post.struct !== 'undefined')

  if (posts.length === 0) {
    return null
  }

  return <ListData
    title={`Latest posts`}
    dataSource={postsData}
    renderItem={(item) =>
      <PostPreview postStruct={item} withActions />
    }
  />
}
