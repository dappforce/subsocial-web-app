import { EntityId } from '@reduxjs/toolkit'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { fetchPosts, PostData, selectPosts } from 'src/rtk/features/posts/postsSlice'

export const useFetchPosts = (ids: EntityId[]): PostData[] => {
  const dispatch = useAppDispatch()

  const entities = useAppSelector(state => selectPosts(state, { ids }), shallowEqual)

  useSubsocialEffect(({ subsocial }) => {
    dispatch(fetchPosts({ api: subsocial, ids }))
  }, [ ids, dispatch ])

  return entities
}
