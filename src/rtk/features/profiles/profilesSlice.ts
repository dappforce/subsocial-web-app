import { Option } from '@polkadot/types'
import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { ProfileContent } from '@subsocial/types'
import { SocialAccount } from '@subsocial/types/substrate/interfaces'
import { ApiAndIds, createFetchOne, createFilterNewIds, selectManyByIds, selectOneById, ThunkApiConfig } from 'src/rtk/app/helpers'
import { getUniqueContentIds, NormalizedProfile, normalizeProfileStructs, SocialAccountWithId } from 'src/rtk/app/normalizers'
import { RootState } from 'src/rtk/app/rootReducer'
import { asString } from 'src/utils'
import { fetchContents, selectProfileContentById } from '../contents/contentsSlice'

export type ProfileData = NormalizedProfile & ProfileContent

const profilesAdapter = createEntityAdapter<NormalizedProfile>()

const profilesSelectors = profilesAdapter.getSelectors<RootState>(state => state.profiles)

// Rename the exports for readability in component usage
export const {
  selectById: selectProfileStructById,
  selectIds: selectProfileIds,
  selectEntities: selectProfileEntities,
  selectAll: selectAllProfiles,
  selectTotal: selectTotalProfiles
} = profilesSelectors

export const selectProfile = (state: RootState, id: EntityId): ProfileData | undefined =>
  selectOneById(state, id, selectProfileStructById, selectProfileContentById)

export const selectProfiles = (state: RootState, ids: EntityId[]): ProfileData[] =>
  selectManyByIds(state, ids, selectProfileStructById, selectProfileContentById)

const filterNewIds = createFilterNewIds(selectProfileIds)

type FetchArgs = ApiAndIds & {
  withContent?: boolean
}

export const fetchProfiles = createAsyncThunk<NormalizedProfile[], FetchArgs, ThunkApiConfig>(
  'profiles/fetchMany',
  async ({ api, ids: accountIds, withContent = true }, { getState, dispatch }) => {

    const ids = accountIds.map(asString)
    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their profiles are already loaded.
      return []
    }

    // TODO rewrite: findSocialAccounts should return SocialAccount with id: AccountId
    // const structs = await api.substrate.findSocialAccounts(newIds)

    const substrateApi = await api.substrate.api
    const structs = await substrateApi.query.profiles
      .socialAccountById.multi(newIds) as Option<SocialAccount>[]

    const structWithIdArr: SocialAccountWithId[] = []

    structs.forEach((structOpt, i) => {
      if (structOpt.isSome) {
        structWithIdArr.push({
          id: ids[i],
          struct: structOpt.unwrap()
        })
      }
    })
    
    const entities = normalizeProfileStructs(structWithIdArr)
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
