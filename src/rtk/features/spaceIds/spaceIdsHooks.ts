import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId } from 'src/types'
import { fetchSpaceIdsFollowedByAccount, _selectSpaceIdsFollowedByAccount } from './followedSpaceIdsSlice'
import { fetchSpaceIdsOwnedByAccount, _selectSpaceIdsOwnedByAccount } from './ownedSpaceIdsSlice'

export const useFetchMySpaceIds = (myAccount: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsOwnedByAccount, fetchSpaceIdsOwnedByAccount, { id: myAccount })
}

export const useFetchFollowedSpaceIds = (follower: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsFollowedByAccount, fetchSpaceIdsFollowedByAccount, { id: follower })
}