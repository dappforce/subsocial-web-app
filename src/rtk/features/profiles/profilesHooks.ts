import { EntityId } from '@reduxjs/toolkit'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { fetchProfiles, ProfileData, selectProfiles } from 'src/rtk/features/profiles/profilesSlice'

export const useFetchProfiles = (ids: EntityId[]): ProfileData[] => {
  const dispatch = useAppDispatch()

  const entities = useAppSelector(state => selectProfiles(state, ids), shallowEqual)

  useSubsocialEffect(({ subsocial }) => {
    dispatch(fetchProfiles({ api: subsocial, ids }))
  }, [ ids, dispatch ])

  return entities
}
