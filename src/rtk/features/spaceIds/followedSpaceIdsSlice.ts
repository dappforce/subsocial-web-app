import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { SpaceId, AccountId } from 'src/types'
import { bnsToIds } from 'src/types/utils'

export type SpaceIdsFollowedByAccount = {
  /** `id` is an account id that follows spaces. */
  id: AccountId
  followedSpaceIds: SpaceId[]
}

const adapter = createEntityAdapter<SpaceIdsFollowedByAccount>()

const selectors = adapter.getSelectors<RootState>(state => state.followedSpaceIds)

// Rename the exports for readability in component usage
export const {
  // selectById: selectSpaceIdsFollowedByAccount,
  selectIds: selectAllSpaceFollowers,
  // selectEntities: selectFollowedSpaceIdsEntities,
  // selectAll: selectAllFollowedSpaceIds,
  // selectTotal: selectTotalSpaceFollowers
} = selectors

export const _selectSpaceIdsFollowedByAccount:
  SelectOneFn<Args, SpaceIdsFollowedByAccount | undefined> = (
    state, 
    { id: follower }
  ) =>
    selectors.selectById(state, follower)

export const selectSpaceIdsFollowedByAccount = (state: RootState, id: AccountId) => 
  _selectSpaceIdsFollowedByAccount(state, { id })?.followedSpaceIds

type Args = {}

type FetchOneSpaceIdsArgs = FetchOneArgs<Args>

type FetchOneRes = SpaceIdsFollowedByAccount | undefined

export const fetchSpaceIdsFollowedByAccount = createAsyncThunk
  <FetchOneRes, FetchOneSpaceIdsArgs, ThunkApiConfig>(
  'followedSpaceIds/fetchOne',
  async ({ api, id }, { getState }): Promise<FetchOneRes> => {

    const follower = id as AccountId
    const knownSpaceIds = selectSpaceIdsFollowedByAccount(getState(), follower)
    const isKnownFollower = typeof knownSpaceIds !== 'undefined'
    if (isKnownFollower) {
      // Nothing to load: space ids followed by this account are already loaded.
      return undefined
    }

    const spaceIds = await api.substrate.spaceIdsFollowedByAccount(follower)

    return {
      id: follower,
      followedSpaceIds: bnsToIds(spaceIds)
    }
  }
)

const slice = createSlice({
  name: 'followedSpaceIds',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertFollowedSpaceIdsByAccount: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaceIdsFollowedByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  }
})

export const {
  upsertFollowedSpaceIdsByAccount,
} = slice.actions

export default slice.reducer
