import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { PostId } from 'src/types'
import { fetchMyPostReactions, prependPostIdWithMyAddress, ReactionStruct, selectMyPostReactionsByPostIds, upsertMyPostReaction } from './myPostReactionsSlice'

export const useFetchMyPostReactions = (postIds: PostId[]) => {
  const myAddress = useMyAddress()
  return useFetchEntities(selectMyPostReactionsByPostIds, fetchMyPostReactions, { ids: postIds, myAddress })
}

export const useFetchMyReactionByPostId = (postId: PostId) => {
  const myAddress = useMyAddress()
  return useFetchEntity(selectMyPostReactionsByPostIds, fetchMyPostReactions, { id: postId, myAddress })
}

export const useCreateUpsertReaction = () => {
  const myAddress = useMyAddress()
  return useActions<ReactionStruct>(({ dispatch, args: { id: postId, ...args } }) => {
    
    myAddress && dispatch(upsertMyPostReaction({
      id: prependPostIdWithMyAddress(postId, myAddress),
      ...args
    }))
  })
}