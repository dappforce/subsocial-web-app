import { VoidFn } from '@polkadot/api/types'
import { PostId, Post } from '@subsocial/types/substrate/interfaces'
import { useState, useEffect } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { useAppDispatch } from 'src/rtk/app/store'
import { PostStruct, flattenPostStruct } from 'src/types'
import { fetchPosts, SelectPostArgs, selectPosts, SelectPostsArgs, upsertPost } from './postsSlice'
import { Option } from '@polkadot/types'

export const useFetchPost = (args: SelectPostArgs) => {
  return useFetchEntity(selectPosts, fetchPosts, args)
}

export const useFetchPosts = (args: SelectPostsArgs) => {
  return useFetchEntities(selectPosts, fetchPosts, args)
}

export const useCreateReloadPosts = () => {
  return useActions<SelectPostsArgs>(({ dispatch, api, args: { ids } }) =>
    dispatch(fetchPosts({ api, ids: ids, reload: true })))
}

export const useCreateReloadPost = () => {
  return useActions<SelectPostArgs>(({ dispatch, api, args: { id } }) =>
    dispatch(fetchPosts({ api, ids: [ id ], reload: true })))
}

export const useCreateUpsertPost = () => {
  return useActions<PostStruct>(({ dispatch, args }) =>
    dispatch(upsertPost(args)))
}

export const useSubscribeToPostUpdates = (id: PostId) => {
  const [ struct, setStruct ] = useState<PostStruct>()
  const [ structStr, setStructStr ] = useState<string>('')
  const dispatch = useAppDispatch()

  useSubsocialEffect(({ subsocial: { substrate }}) => {
    let unsub: VoidFn
  
    const subscribe = async () => {
      const readyApi = await substrate.api

      unsub = await readyApi.query.posts.postById(id, (post: Option<Post>) => {
        if (post.isEmpty) return

        const struct = flattenPostStruct(post.unwrap())
        setStruct(struct)
        setStructStr(JSON.stringify(struct))
      })
    }

    subscribe()

    return () => { unsub && unsub() }
  }, [ id ])

  useEffect(() => {
    if (!struct) return

    dispatch(upsertPost(struct))
  }, [ dispatch, structStr ])

}
