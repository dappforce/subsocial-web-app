import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AnyAccountId, ProfileContent, ProfileData } from '@subsocial/types'
import { SubsocialApi } from '@subsocial/api'
import { AppThunk } from '../../app/store'
import { NormalizedProfile } from 'src/rtk/app/normalizers'

export type FullProfile = NormalizedProfile & ProfileContent

/** Profile id should be a string representation of an owner's account address. */
type AccountId = string

type ProfilesState = {
  profileById: Record<AccountId, ProfileData>
  isLoading: boolean
  error: string | null
}

const initialState: ProfilesState = {
  profileById: {},
  isLoading: false,
  error: null
}

const profiles = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    getProfilesStart (state) {
      state.isLoading = true
      state.error = null
    },
    getProfilesFailure (state, action: PayloadAction<string>) {
      state.isLoading = false
      state.error = action.payload
    },
    getProfilesSuccess (state, { payload: profiles }: PayloadAction<ProfileData[]>) {
      state.isLoading = false
      state.error = null

      profiles.forEach(profileData => {
        const { profile } = profileData
        if (profile) {
          const id = profile.created.account.toString()
          state.profileById[id] = profileData
        }
      })
    },
  }
})

export const {
  getProfilesStart,
  getProfilesFailure,
  getProfilesSuccess,
} = profiles.actions

export default profiles.reducer

export const fetchProfiles = (
  subsocial: SubsocialApi,
  ids: AnyAccountId[]
): AppThunk => async dispatch => {

  // TODO Get only not found items.
  // TODO Consider some flag that will reload data: reload, force, subscribe? 

  try {
    dispatch(getProfilesStart())
    const profiles = await subsocial.findProfiles(ids)
    dispatch(getProfilesSuccess(profiles))
  } catch (err) {
    dispatch(getProfilesFailure(err.toString()))
  }
}

export const fetchProfile = (
  subsocial: SubsocialApi,
  id: AnyAccountId
): AppThunk => async dispatch => {
  dispatch(fetchProfiles(subsocial, [ id ]))
}
