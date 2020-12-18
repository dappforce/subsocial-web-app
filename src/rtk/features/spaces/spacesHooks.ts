import { useActions } from 'src/rtk/app/helpers'
import { useFetchEntities, useFetchEntity } from 'src/rtk/app/hooksCommon'
import { fetchSpaces, SelectSpaceArgs, selectSpaces, SelectSpacesArgs } from './spacesSlice'

export const useFetchSpace = (args: SelectSpaceArgs) => {
  return useFetchEntity(selectSpaces, fetchSpaces, args)
}

export const useFetchSpaces = (args: SelectSpacesArgs) => {
  return useFetchEntities(selectSpaces, fetchSpaces, args)
}

export const useCreateReloadSpace = () => {
  return useActions<SelectSpaceArgs>(({ dispatch, api, args: { id } }) =>
    dispatch(fetchSpaces({ api, ids: [ id ], reload: true })))
} 