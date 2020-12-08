import { isDef } from '@subsocial/utils'
import React from 'react'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from 'src/rtk/app/store'
import { selectPost } from 'src/rtk/features/posts/postsSlice'
import { isPublic, PostId, PostWithSomeDetails } from 'src/types'
import PostPreview from '../posts/view-post/PostPreview'

type Props = {
  postId: PostId
}

function isUnlistedPost (post?: PostWithSomeDetails): boolean {
  return !post || !isPublic(post.post) || !isDef(post.space) || !isPublic(post.space)
}

export const PublicPostPreviewById = React.memo(({ postId }: Props) => {
  const post = useAppSelector(state => selectPost(state, { id: postId }), shallowEqual)

  if (!post || isUnlistedPost(post)) return null

  // Super fast render of post title.
  // return <li className='mb-2'>{post.post.content?.title}</li>

  return <PostPreview postDetails={post} withActions />
})
