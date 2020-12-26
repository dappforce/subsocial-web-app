import { useRouter } from 'next/router'
import { getPageOfIds } from 'src/components/utils/getIds'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity, useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { AccountId } from 'src/types'
import { _selectAccountIdsFollowedByAccount, fetchAccountIdsFollowedByAccount } from './followedAccountIdsSlice'
import { fetchProfiles, SelectProfileArgs, selectProfiles, SelectProfilesArgs } from './profilesSlice'

export const useFetchProfile = (args: SelectProfileArgs) => {
  return useFetchEntity(selectProfiles, fetchProfiles, args)
}

export const useFetchProfiles = (args: SelectProfilesArgs) => {
  return useFetchEntities(selectProfiles, fetchProfiles, args)
}

export const useCreateReloadProfile = () => {
  return useActions<SelectProfileArgs>(({ dispatch, api, args: { id } }) =>
    dispatch(fetchProfiles({ api, ids: [ id ], reload: true })))
}

export const useFetchAccountIdsByFollower = (follower: AccountId) => {
  return useFetchOneEntity(_selectAccountIdsFollowedByAccount, fetchAccountIdsFollowedByAccount, { id: follower })
}

const useFetchPageOfProfilesByIds = (accountIds: AccountId[] = []) => {
  const { query } = useRouter()

  const ids = getPageOfIds(accountIds, query)
  
  const { entities, error, loading } = useFetchProfiles({ ids })

  return { 
    profiles: entities,
    accountIds,
    loading,
    error,
  }
}

export const useFetchPageOfProfilesByFollower = (owner: AccountId) => {
  const { entity, loading: l1, error: err1 } = useFetchAccountIdsByFollower(owner)
  const { accountIds, profiles, loading: l2, error: err2 } = useFetchPageOfProfilesByIds(entity?.followedAccountIds)

  return { 
    profiles,
    accountIds,
    loading: l2 || l1,
    error: err2 || err1
  }
}

export const useCreateReloadAccountIdsByFollower = () => {
  return useActions<SelectProfileArgs>(({ dispatch, args: { id }, ...props }) => {
    dispatch(fetchAccountIdsFollowedByAccount({ id, reload: true, ...props }))
  })
}