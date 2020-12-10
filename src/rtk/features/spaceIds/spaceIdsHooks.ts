import { useRouter } from 'next/router'
import { getPageOfIds } from 'src/components/utils/getIds'
import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId, SpaceId } from 'src/types'
import { useFetchSpaces } from '../spaces/spacesHooks'
import { fetchSpaceIdsFollowedByAccount, _selectSpaceIdsFollowedByAccount } from './followedSpaceIdsSlice'
import { fetchSpaceIdsOwnedByAccount, _selectSpaceIdsOwnedByAccount } from './ownedSpaceIdsSlice'

export const useFetchOwnedSpaceIds = (owner: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsOwnedByAccount, fetchSpaceIdsOwnedByAccount, { id: owner })
}

export const useFetchFollowedSpaceIds = (follower: AccountId) => {
  return useFetchOneEntity(_selectSpaceIdsFollowedByAccount, fetchSpaceIdsFollowedByAccount, { id: follower })
}

const useFetchSpacesOfPage = (spaceIds: SpaceId[] = []) => {
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

export const useFetchOwnedSpaces = (owner: AccountId) => {
  const { entity, loading: l1, error: err1 } = useFetchOwnedSpaceIds(owner)
  const { spaceIds, spaces, loading: l2, error: err2 } = useFetchSpacesOfPage(entity?.mySpaceIds)

  return { 
    spaces,
    spaceIds,
    loading: l2 || l1,
    error: err2 || err1,
  }
}

export const useFetchFollowedSpaces = (owner: AccountId) => {
  const { entity, loading: l1, error: err1 } = useFetchFollowedSpaceIds(owner)
  const { spaceIds, spaces, error: l2, loading: err2 } = useFetchSpacesOfPage(entity?.followedSpaceIds)

  return { 
    spaces,
    spaceIds,
    loading: l2 || l1,
    error: err2 || err1
  }
}