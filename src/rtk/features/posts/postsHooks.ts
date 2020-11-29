import { EntityId } from 'src/rtk/app/dto'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { fetchPosts, selectPosts } from './postsSlice'

export const useFetchPost = (id: EntityId) => {
  return useFetchEntity(selectPosts, fetchPosts, { id })
}

export const useFetchPosts = (ids: EntityId[]) => {
  return useFetchEntities(selectPosts, fetchPosts, { ids })
}
