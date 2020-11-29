import { EntityId } from 'src/rtk/app/dto'
import { useFetchEntities } from 'src/rtk/app/hooksCommon'
import { fetchPosts, selectPosts } from './postsSlice'

export const useFetchPosts = (ids: EntityId[]) => {
  return useFetchEntities(selectPosts, fetchPosts, { ids })
}
