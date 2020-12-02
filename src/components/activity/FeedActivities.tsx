import React from 'react'
import { isDef } from '@subsocial/utils'
import { LoadMoreFn } from './NotificationUtils'
import { PostWithAllDetails } from 'src/types'
import PostPreview from '../posts/view-post/PostPreview'
import { LoadMoreProps, ActivityProps } from './types'
import BN from 'bn.js'
import { InnerActivities } from './InnerActivities'
import { FlatSubsocialApi } from '../substrate'

const postsFromActivity = async (flatApi: FlatSubsocialApi, postIds: BN[]): Promise<PostWithAllDetails[]> => {

  // TODO use redux
  const posts = await flatApi.findPublicPostsWithAllDetails(postIds)

  return posts.filter(x => isDef(x.space))
}

export const getLoadMoreFeedFn = (getActivity: LoadMoreFn, keyId: 'post_id' | 'comment_id') =>
  async (props: LoadMoreProps) => {
    const { flatApi, address, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const activity = await getActivity(address, offset, size) || []
    const postIds = activity.map(x => new BN(x[keyId]))

    return postsFromActivity(flatApi, postIds)
  }

export const FeedActivities = (props: ActivityProps<PostWithAllDetails>) =>
  <InnerActivities
    {...props}
    renderItem={(x) => <PostPreview key={x.post.id} postDetails={x} withActions />}
  />



