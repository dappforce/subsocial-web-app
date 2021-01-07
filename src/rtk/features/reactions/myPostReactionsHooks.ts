import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { PostId } from 'src/types'
import { fetchMyReactionsByPostIds, prependPostIdWithMyAddress, ReactionStruct, selectMyReactionsByPostIds, upsertMyReaction } from './myPostReactionsSlice'

export const useFetchMyReactionByPostId = (postId: PostId) => {
  const myAddress = useMyAddress()
  return useFetchEntity(
    selectMyReactionsByPostIds,
    fetchMyReactionsByPostIds,
    { id: postId, myAddress }
  )
}

export const useFetchMyReactionsByPostIds = (postIds: PostId[]) => {
  const myAddress = useMyAddress()
  return useFetchEntities(
    selectMyReactionsByPostIds,
    fetchMyReactionsByPostIds,
    { ids: postIds, myAddress }
  )
}

export const useCreateUpsertMyReaction = () => {
  const myAddress = useMyAddress()
  return useActions<ReactionStruct>(({ dispatch, args: { id: postId, ...args } }) => {
    myAddress && dispatch(upsertMyReaction({
      id: prependPostIdWithMyAddress(postId, myAddress),
      ...args
    }))
  })
}