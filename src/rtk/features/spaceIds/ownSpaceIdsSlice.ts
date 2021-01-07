import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { SpaceId, AccountId } from 'src/types'
import { bnsToIds } from 'src/types/utils'

type Entity = {
  /** `id` is an account address that owns spaces. */
  id: AccountId
  ownSpaceIds: SpaceId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.ownSpaceIds)

type Args = {}

export const selectEntityOfSpaceIdsByOwner:
  SelectOneFn<Args, MaybeEntity> =
  (state, { id: myAddress }) =>
    selectors.selectById(state, myAddress)

export const selectSpaceIdsByOwner = (state: RootState, id: AccountId) => 
  selectEntityOfSpaceIdsByOwner(state, { id })?.ownSpaceIds

type FetchOneSpaceIdsArgs = FetchOneArgs<Args>

export const fetchSpaceIdsOwnedByAccount = createAsyncThunk
  <MaybeEntity, FetchOneSpaceIdsArgs, ThunkApiConfig>(
  'ownSpaceIds/fetchOne',
  async ({ api, id }, { getState }): Promise<MaybeEntity> => {

    const myAddress = id as AccountId
    const knownSpaceIds = selectSpaceIdsByOwner(getState(), myAddress)
    const isKnownOwner = typeof knownSpaceIds !== 'undefined'
    if (isKnownOwner) {
      // Nothing to load: space ids owned by this account are already loaded.
      return undefined
    }

    const spaceIds = await api.substrate.spaceIdsByOwner(myAddress)
    return {
      id: myAddress,
      ownSpaceIds: bnsToIds(spaceIds)
    }
  }
)

const slice = createSlice({
  name: 'ownSpaceIds',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertOwnSpaceIds: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaceIdsOwnedByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  }
})

export const {
  upsertOwnSpaceIds,
} = slice.actions

export default slice.reducer
