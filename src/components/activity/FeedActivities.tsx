import React from 'react'
import { isDef } from '@subsocial/utils'
import { LoadMoreFn } from './NotificationUtils'
import { isPublic, PostId } from 'src/types'
import PostPreview from '../posts/view-post/PostPreview'
import { LoadMoreProps, ActivityProps } from './types'
import { InnerActivities } from './InnerActivities'
import { fetchPosts, selectPost } from 'src/rtk/features/posts/postsSlice'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from 'src/rtk/app/store'

export const getLoadMoreFeedFn = (getActivity: LoadMoreFn, keyId: 'post_id' | 'comment_id') =>
  async (props: LoadMoreProps): Promise<PostId[]> => {
    const { subsocial, dispatch, address, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const activity = await getActivity(address, offset, size) || []
    const postIds = activity.map(x => x[keyId]!)

    await dispatch(fetchPosts({ api: subsocial, ids: postIds }))
  
    return postIds
  }

const FeedPostPeview = React.memo(({ postId }: { postId: PostId }) => {
  const post = useAppSelector(state => selectPost(state, { id: postId }), shallowEqual)

  if (!post || !isPublic(post.post) || !isDef(post.space) || !isPublic(post.space)) return null

  // Super fast render of post title.
  // return <li className='mb-2'>{post.post.content?.title}</li>

  return <PostPreview postDetails={post} withActions />
})

export const FeedActivities = (props: ActivityProps<PostId>) => {
  return <InnerActivities
    {...props}
    getKey={postId => postId}
    renderItem={(postId) => <FeedPostPeview postId={postId} />}
  />
}
