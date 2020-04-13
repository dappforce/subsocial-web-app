import React from 'react';
import { Post } from '@subsocial/types/substrate/interfaces';
import ListData from '../utils/DataList';
import { ViewPostPage } from '../posts/ViewPost';
import { PostDataListItem } from '../posts/LoadPostUtils';

type Props = {
  postsData: PostDataListItem[]
}

export const LatestPosts = (props: Props) => {
  const { postsData = [] } = props
  const posts = postsData.filter((x) => typeof x.postData.struct !== 'undefined')

  if (posts.length === 0) {
    return null
  }

  return <ListData
    title={`Latest posts`}
    dataSource={postsData}
    renderItem={(item) =>
      <ViewPostPage
        key={(item.postData.struct as Post).id.toString()}
        variant='preview'
        postData={item.postData}
        postExtData={item.postExtData}
      />
    }
  />
}
