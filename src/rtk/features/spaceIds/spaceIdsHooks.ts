import { useRouter } from 'next/router'
import { getPageOfIds } from 'src/components/utils/getIds'
import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId, SpaceId } from 'src/types'
import { useFetchSpaces } from '../spaces/spacesHooks'
import { fetchSpaceIdsFollowedByAccount, _selectSpaceIdsFollowedByAccount } from './followedSpaceIdsSlice'
import { fetchSpaceIdsOwnedByAccount, _selectSpaceIdsOwnedByAccount } from './ownSpaceIdsSlice'

export const useFetchSpaceIdsByOwner = (owner: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsOwnedByAccount, fetchSpaceIdsOwnedByAccount, { id: owner })
}

export const useFetchSpaceIdsByFollower = (follower: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsFollowedByAccount, fetchSpaceIdsFollowedByAccount, { id: follower })
}

const useFetchPageOfSpacesByIds = (spaceIds: SpaceId[] = []) => {
  const { query } = useRouter()

  const ids = getPageOfIds(spaceIds, query)
  
  const { entities, error, loading } = useFetchSpaces({ ids })

  return { 
    spaces: entities,
    spaceIds,
    loading,
    error,
  }
}

export const useFetchPageOfSpacesByOwner = (owner: AccountId) => {
  const { entity, loading: l1, error: err1 } = useFetchSpaceIdsByOwner(owner)
  const { spaceIds, spaces, loading: l2, error: err2 } = useFetchPageOfSpacesByIds(entity?.ownSpaceIds)

  return { 
    spaces,
    spaceIds,
    loading: l2 || l1,
    error: err2 || err1,
  }
}

export const useFetchPageOfSpacesByFollower = (owner: AccountId) => {
  const { entity, loading: l1, error: err1 } = useFetchSpaceIdsByFollower(owner)
  const { spaceIds, spaces, loading: l2, error: err2 } = useFetchPageOfSpacesByIds(entity?.followedSpaceIds)

  return { 
    spaces,
    spaceIds,
    loading: l2 || l1,
    error: err2 || err1
  }
}