import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntity } from 'src/rtk/app/hooksCommon'
import { useAppDispatch } from 'src/rtk/app/store'
import { PostId } from 'src/types'
import { fetchPostReactions, ReactionStruct, removeAllReaction, selectPostReactionsByPostIds, upsertPostReaction } from './postReactionsSlice'

export const useFetchMyPostReactions = (postIds: PostId[]) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  
  useSubsocialEffect(({ subsocial: api }) => {
    if (!myAddress) return 
    dispatch(fetchPostReactions({ ids: postIds, myAddress, api }))
  }, [ dispatch, myAddress || '', postIds ])

}

export const useFetchReactionByPostId = (id: PostId) => {
  const myAddress = useMyAddress()
  return useFetchEntity(selectPostReactionsByPostIds, fetchPostReactions, { id, myAddress })
}

export const useGetUpsertReaction = () => {
  return useActions<ReactionStruct>(({ dispatch, args }) => {
    dispatch(upsertPostReaction(args))
  })
}

export const useGetRemoveAllReactions = () => {
  return useActions<{}>(({ dispatch }) => {
    dispatch(removeAllReaction())
  })
}