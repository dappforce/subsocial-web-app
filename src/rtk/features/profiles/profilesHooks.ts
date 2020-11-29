import { EntityId } from 'src/rtk/app/dto'
import { useFetchEntities } from 'src/rtk/app/hooksCommon'
import { fetchProfiles, selectProfiles } from './profilesSlice'

export const useFetchProfiles = (ids: EntityId[]) => {
  return useFetchEntities(selectProfiles, fetchProfiles, { ids })
}
