import React from 'react';
import { Post } from '@subsocial/types/substrate/interfaces';
import ListData from '../utils/DataList';
import { ViewPostPage } from '../posts/ViewPost';
import { ExtendedPostData } from '@subsocial/types';

type Props = {
  postsData: ExtendedPostData[]
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
      <ViewPostPage
        key={(item.post.struct as Post).id.toString()}
        variant='preview'
        postData={item.post}
        postExtData={item.ext}
        owner={item.owner}
        blog={{} as any}
      />
    }
  />
}
