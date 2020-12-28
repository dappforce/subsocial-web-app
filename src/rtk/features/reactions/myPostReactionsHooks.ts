import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { PostId } from 'src/types'
import { fetchMyPostReactions, ReactionStruct, removeAllMyPostReactions, selectMyPostReactionsByPostIds, upsertMyPostReaction } from './myPostReactionsSlice'

export const useFetchMyPostReactions = (postIds: PostId[]) => {
  const myAddress = useMyAddress()
  return useFetchEntities(selectMyPostReactionsByPostIds, fetchMyPostReactions, { ids: postIds, myAddress })
}

export const useFetchMyReactionByPostId = (postId: PostId) => {
  const myAddress = useMyAddress()
  return useFetchEntity(selectMyPostReactionsByPostIds, fetchMyPostReactions, { id: postId, myAddress })
}

export const useCreateUpsertReaction = () => {
  return useActions<ReactionStruct>(({ dispatch, args }) => {
    dispatch(upsertMyPostReaction(args))
  })
}

export const useCreateRemoveAllReactions = () => {
  return useActions<{}>(({ dispatch }) => {
    dispatch(removeAllMyPostReactions())
  })
}