import React from 'react'
import { PostWithAllDetails } from 'src/types'
import DataList from '../lists/DataList'
import { PublicPostPreviewById } from '../posts/PublicPostPreview'

type Props = {
  postsData: PostWithAllDetails[]
  type: 'post' | 'comment'
}

export const LatestPosts = (props: Props) => {
  const { postsData = [], type } = props
  const posts = postsData.filter((x) => typeof x.post.struct !== 'undefined')

  if (posts.length === 0) {
    return null
  }

  return <DataList
    title={`Latest ${type}s`}
    dataSource={postsData}
    getKey={item => item.id}
    renderItem={(item) =>
      <PublicPostPreviewById postId={item.id} />
    }
  />
}
