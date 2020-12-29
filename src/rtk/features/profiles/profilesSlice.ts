import { EntityId, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { CommonVisibility, createFetchOne, createSelectUnknownIds, FetchManyArgs, SelectManyArgs, selectManyByIds, SelectOneArgs, selectOneById, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { flattenProfileStructs, getUniqueContentIds, ProfileData, ProfileStruct } from 'src/types'
import { asString } from 'src/utils'
import { fetchContents, selectProfileContentById } from '../contents/contentsSlice'

const profilesAdapter = createEntityAdapter<ProfileStruct>()

const profilesSelectors = profilesAdapter.getSelectors<RootState>(state => state.profiles)

// Rename the exports for readability in component usage
export const {
  selectById: selectProfileStructById,
  selectIds: selectProfileIds,
  selectEntities: selectProfileEntities,
  selectAll: selectAllProfiles,
  selectTotal: selectTotalProfiles
} = profilesSelectors

export type ProfileVisibility = CommonVisibility

type Args = {
  visibility?: ProfileVisibility
  withContent?: boolean
}

export type SelectProfileArgs = SelectOneArgs<Args>
export type SelectProfilesArgs = SelectManyArgs<Args>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type FetchProfileArgs = FetchOneArgs<Args>
type FetchProfilesArgs = FetchManyArgs<Args>

export const selectProfile = (state: RootState, id: EntityId): ProfileData | undefined =>
  selectOneById(state, id, selectProfileStructById, selectProfileContentById)

// TODO apply visibility filter
export const selectProfiles = (state: RootState, { ids }: SelectProfilesArgs): ProfileData[] =>
  selectManyByIds(state, ids, selectProfileStructById, selectProfileContentById)

const selectUnknownProfileIds = createSelectUnknownIds(selectProfileIds)

export const fetchProfiles = createAsyncThunk<ProfileStruct[], FetchProfilesArgs, ThunkApiConfig>(
  'profiles/fetchMany',
  async ({ api, ids: accountIds, withContent = true, reload }, { getState, dispatch }) => {

    const ids = accountIds.map(asString)

    let newIds = ids
    if (!reload) {
      newIds = selectUnknownProfileIds(getState(), ids)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their profiles are already loaded.
        return []
      }
    }

    const structs = await api.substrate.findSocialAccounts(newIds)

    const entities = flattenProfileStructs(structs)
    const fetches: Promise<any>[] = []

    if (withContent) {
      const ids = getUniqueContentIds(entities)
      if (ids.length) {
        fetches.push(dispatch(fetchContents({ api, ids })))
      }
    }

    await Promise.all(fetches)

    return entities
  }
)

export const fetchProfile = createFetchOne(fetchProfiles)

const profiles = createSlice({
  name: 'profiles',
  initialState: profilesAdapter.getInitialState(),
  reducers: {
    updateProfile: profilesAdapter.updateOne
  },
  extraReducers: builder => {
    builder.addCase(fetchProfiles.fulfilled, profilesAdapter.upsertMany)
    // builder.addCase(fetchProfiles.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export default profiles.reducer
