import React from 'react'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { PostId } from 'src/types'
import { PublicPostPreviewById } from '../posts/PublicPostPreview'
import { InnerActivities } from './InnerActivities'
import { ActivityProps, LoadMoreFn, LoadMoreProps } from './types'

export const getLoadMoreFeedFn = (getActivity: LoadMoreFn, keyId: 'post_id' | 'comment_id') =>
  async (props: LoadMoreProps): Promise<PostId[]> => {
    const { subsocial, dispatch, address, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const activity = await getActivity(address, offset, size) || []
    const postIds = activity.map(x => x[keyId]!)

    await dispatch(fetchPosts({ api: subsocial, ids: postIds, withReactionByAccount: address }))
    return postIds
  }

export const FeedActivities = (props: ActivityProps<PostId>) => {

  return <InnerActivities
    {...props}
    getKey={postId => postId}
    renderItem={(postId: PostId) => <PublicPostPreviewById postId={postId} />}
  />
}
