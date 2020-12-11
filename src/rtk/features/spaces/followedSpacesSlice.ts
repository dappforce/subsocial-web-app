import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { SpaceId, AccountId } from 'src/types'
import { bnsToIds } from 'src/types/utils'

export type SpaceIdsFollowedByAccount = {
  /** `id` is an account id that follows spaces. */
  id: AccountId
  followedSpaceIds: SpaceId[]
}

const adapter = createEntityAdapter<SpaceIdsFollowedByAccount>()

const spacesSelectors = adapter.getSelectors<RootState>(state => state.followedSpaceIds)

// Rename the exports for readability in component usage
export const {
  // selectById: selectSpaceIdsFollowedByAccount,
  selectIds: selectAllSpaceFollowers,
  // selectEntities: selectFollowedSpaceIdsEntities,
  // selectAll: selectAllFollowedSpaceIds,
  // selectTotal: selectTotalSpaceFollowers
} = spacesSelectors

export const selectSpaceIdsFollowedByAccount = (state: RootState, follower: AccountId): SpaceId[] => {
  const res = spacesSelectors.selectById(state, follower)
  return res ? res.followedSpaceIds : []
}

type Args = {}

type FetchOneSpaceIdsArgs = FetchOneArgs<Args>

type FetchOneRes = SpaceIdsFollowedByAccount | undefined

export const fetchSpaceIdsFollowedByAccount = createAsyncThunk
  <FetchOneRes, FetchOneSpaceIdsArgs, ThunkApiConfig>(
  'spaces/fetchOne',
  async ({ api, id }, { getState }) => {

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
