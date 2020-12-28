import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { SpaceId, AccountId } from 'src/types'
import { bnsToIds } from 'src/types/utils'

export type OwnSpaceIds = {
  /** `id` is an account id that owns spaces. */
  id: AccountId
  ownSpaceIds: SpaceId[]
}

const adapter = createEntityAdapter<OwnSpaceIds>()

const selectors = adapter.getSelectors<RootState>(state => state.ownSpaceIds)

type Args = {}

export const _selectSpaceIdsOwnedByAccount:
  SelectOneFn<Args, OwnSpaceIds | undefined> = (
    state,
    { id: myAddress }
  ) =>
    selectors.selectById(state, myAddress)

export const selectSpaceIdsOwnedByAccount = (state: RootState, id: AccountId) => 
  _selectSpaceIdsOwnedByAccount(state, { id })?.ownSpaceIds

type FetchOneSpaceIdsArgs = FetchOneArgs<Args>

type FetchOneRes = OwnSpaceIds | undefined

export const fetchSpaceIdsOwnedByAccount = createAsyncThunk
  <FetchOneRes, FetchOneSpaceIdsArgs, ThunkApiConfig>(
  'ownSpaceIds/fetchOne',
  async ({ api, id }, { getState }): Promise<FetchOneRes> => {

    const myAddress = id as AccountId
    const knownSpaceIds = selectSpaceIdsOwnedByAccount(getState(), myAddress)
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
