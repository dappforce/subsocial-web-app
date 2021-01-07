import { useRouter } from 'next/router'
import { getPageOfIds } from 'src/components/utils/getIds'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId, SpaceId } from 'src/types'
import { useFetchSpaces } from '../spaces/spacesHooks'
import { fetchEntityOfSpaceIdsByFollower, selectEntityOfSpaceIdsByFollower } from './followedSpaceIdsSlice'
import { fetchSpaceIdsOwnedByAccount, selectEntityOfSpaceIdsByOwner } from './ownSpaceIdsSlice'

export const useFetchSpaceIdsByOwner = (owner: AccountId) => {
  return useFetchOneEntity(
    selectEntityOfSpaceIdsByOwner,
    fetchSpaceIdsOwnedByAccount,
    { id: owner }
  )
}

export const useFetchSpaceIdsByFollower = (follower: AccountId) => {
  return useFetchOneEntity(
    selectEntityOfSpaceIdsByFollower,
    fetchEntityOfSpaceIdsByFollower,
    { id: follower }
  )
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

export const useCreateReloadSpaceIdsByOwner = () => {
  return useActions<AccountId>(({ dispatch, args: id, ...props }) => {
    dispatch(fetchSpaceIdsOwnedByAccount({ id, reload: true, ...props }))
  })
}