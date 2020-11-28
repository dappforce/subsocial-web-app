import { EntityId } from '@reduxjs/toolkit'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { fetchPosts, FullPost, selectPosts } from 'src/rtk/features/posts/postsSlice'

export const useFetchPosts = (postIds: EntityId[]): FullPost[] => {
  const dispatch = useAppDispatch()

  const posts = useAppSelector(
    state => selectPosts(state, { ids: postIds }),
    
    // TODO compare by (id + updated_at_block) instead of shallowEqual
    shallowEqual
  )

  useSubsocialEffect(({ subsocial }) => {
    dispatch(fetchPosts({ api: subsocial, ids: postIds }))
  }, [ postIds, dispatch ])

  return posts
}
