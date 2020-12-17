import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { fetchPosts, SelectPostArgs, selectPosts, SelectPostsArgs } from './postsSlice'

export const useFetchPost = (args: SelectPostArgs) => {
  return useFetchEntity(selectPosts, fetchPosts, args)
}

export const useFetchPosts = (args: SelectPostsArgs) => {
  return useFetchEntities(selectPosts, fetchPosts, args)
}

export const useGetReloadPosts = () => {
  return useActions<SelectPostsArgs>(({ dispatch, api, args: { ids } }) =>
    dispatch(fetchPosts({ api, ids: ids, reload: true })))
}

export const useGetReloadPost = () => {
  return useActions<SelectPostArgs>(({ dispatch, api, args: { id } }) =>
    dispatch(fetchPosts({ api, ids: [ id ], reload: true })))
}

