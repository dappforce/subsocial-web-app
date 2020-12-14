import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useMyAddress } from 'src/components/auth/MyAccountContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntity } from 'src/rtk/app/hooksCommon'
import { useAppDispatch } from 'src/rtk/app/store'
import { PostId } from 'src/types'
import { fetchPostReactions, selectPostReactionsByPostIds } from './postReactionsSlice'

export const useFetchMyPostReactions = (postIds: PostId[]) => {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  
  useSubsocialEffect(({ subsocial: api }) => {
    if (!myAddress) return 
    dispatch(fetchPostReactions({ ids: postIds, myAddress, api }))
  }, [ myAddress || '' ])

}

export const useFetchReactionByPostId = (id: PostId) => {
  const myAddress = useMyAddress()
  return useFetchEntity(selectPostReactionsByPostIds, fetchPostReactions, { id, myAddress })
}

type ReloadReactionArgs = {
  id: PostId
}

export const useGetReloadReaction = () => {
  const myAddress = useMyAddress()

  return useActions<ReloadReactionArgs>(({ dispatch, api, args: { id }}) => {
    dispatch(fetchPostReactions({ ids: [ id ], myAddress, api, reload: true }))
  })
}