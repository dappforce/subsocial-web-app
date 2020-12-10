import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId } from 'src/types'
import { fetchSpaceIdsFollowedByAccount, _selectSpaceIdsFollowedByAccount } from './followedSpaceIdsSlice'
import { fetchSpaceIdsOwnedByAccount, _selectSpaceIdsOwnedByAccount } from './ownedSpaceIdsSlice'

export const useFetchOwnedSpaceIds = (owner: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsOwnedByAccount, fetchSpaceIdsOwnedByAccount, { id: owner })
}

export const useFetchFollowedSpaceIds = (follower: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsFollowedByAccount, fetchSpaceIdsFollowedByAccount, { id: follower })
}