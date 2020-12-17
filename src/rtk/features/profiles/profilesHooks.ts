import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { fetchProfiles, SelectProfileArgs, selectProfiles, SelectProfilesArgs } from './profilesSlice'

export const useFetchProfile = (args: SelectProfileArgs) => {
  return useFetchEntity(selectProfiles, fetchProfiles, args)
}

export const useFetchProfiles = (args: SelectProfilesArgs) => {
  return useFetchEntities(selectProfiles, fetchProfiles, args)
}

export const useGetReloadProfile = () => {
  return useActions<SelectProfileArgs>(({ dispatch, api, args: { id } }) =>
    dispatch(fetchProfiles({ api, ids: [ id ], reload: true })))
}
