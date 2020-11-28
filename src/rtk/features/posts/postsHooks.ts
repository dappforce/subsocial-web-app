import { EntityId } from '@reduxjs/toolkit'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { fetchPosts, FullPostWithSpace, selectPostsWithSpaces } from 'src/rtk/features/posts/postsSlice'

export const useFetchPostsByIds = (postIds: EntityId[]): FullPostWithSpace[] => {
  const dispatch = useAppDispatch()

  // TODO compare by (id + updated_at_block) instead of shallowEqual
  const posts = useAppSelector(state => selectPostsWithSpaces(state, postIds), shallowEqual)
  console.log({ posts })

  useSubsocialEffect(({ subsocial }) => {
    dispatch(fetchPosts({ api: subsocial, ids: postIds }))
  }, [ postIds, dispatch ])

  return posts
}
