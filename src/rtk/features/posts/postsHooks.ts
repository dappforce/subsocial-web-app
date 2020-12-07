import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { fetchPosts, SelectPostArgs, selectPosts, SelectPostsArgs } from './postsSlice'

export const useFetchPost = (args: SelectPostArgs) => {
  return useFetchEntity(selectPosts, fetchPosts, args)
}

export const useFetchPosts = (args: SelectPostsArgs) => {
  return useFetchEntities(selectPosts, fetchPosts, args)
}
