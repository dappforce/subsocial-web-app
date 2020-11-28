import { EntityId } from '@reduxjs/toolkit'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { fetchSpaces, FullSpace, selectSpaces } from 'src/rtk/features/spaces/spacesSlice'

export const useFetchSpacesByIds = (spaceIds: EntityId[]): FullSpace[] => {
  const dispatch = useAppDispatch()

  // TODO compare by (id + updated_at_block) instead of shallowEqual
  const spaces = useAppSelector(state => selectSpaces(state, spaceIds), shallowEqual)

  useSubsocialEffect(({ subsocial }) => {
    dispatch(fetchSpaces({ api: subsocial, ids: spaceIds }))
  }, [ spaceIds, dispatch ])

  return spaces
}
