import React from 'react';
import { Post } from '@subsocial/types/substrate/interfaces';
import ListData from '../utils/DataList';
import { PostDataListItem, ViewPostPage } from '../posts/ViewPost';

type Props = {
  postsData: PostDataListItem[]
}

export const LatestPosts = (props: Props) => {
  const { postsData = [] } = props
  const posts = postsData.filter((x) => typeof x.postData.post !== 'undefined')

  if (posts.length === 0) {
    return null
  }

  return <ListData
    title={`Latest posts`}
    dataSource={postsData}
    renderItem={(item) =>
      <ViewPostPage
        key={(item.postData.post as Post).id.toString()}
        variant='preview'
        postData={item.postData}
        postExtData={item.postExtData}
      />
    }
  />
}
