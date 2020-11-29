import { EntityId } from 'src/rtk/app/dto'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { fetchSpaces, selectSpaces } from './spacesSlice'

export const useFetchSpace = (id: EntityId) => {
  return useFetchEntity(selectSpaces, fetchSpaces, { id })
}

export const useFetchSpaces = (ids: EntityId[]) => {
  return useFetchEntities(selectSpaces, fetchSpaces, { ids })
}
