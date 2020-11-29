import { EntityId } from 'src/rtk/app/dto'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { fetchProfiles, selectProfiles } from './profilesSlice'

export const useFetchProfile = (id: EntityId) => {
  return useFetchEntity(selectProfiles, fetchProfiles, { id })
}

export const useFetchProfiles = (ids: EntityId[]) => {
  return useFetchEntities(selectProfiles, fetchProfiles, { ids })
}
