import { GenericAccountId } from '@polkadot/types'
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId } from 'src/types'

type Entity = {
  /** `id` is an account address id that follows accounts. */
  id: AccountId
  followingAccountIds: AccountId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.followedAccountIds)

export const selectEntityOfAccountIdsByFollower:
  SelectOneFn<Args, MaybeEntity> =
  (state, { id: follower }) =>
    selectors.selectById(state, follower)

export const selectAccountIdsByFollower = (state: RootState, id: AccountId) => 
  selectEntityOfAccountIdsByFollower(state, { id })?.followingAccountIds

type Args = {
  reload?: boolean
}

type FetchOneAccountIdsArgs = FetchOneArgs<Args>

export const fetchEntityOfAccountIdsByFollower = createAsyncThunk
  <MaybeEntity, FetchOneAccountIdsArgs, ThunkApiConfig>(
  'followedAccountIds/fetchOne',
  async ({ api, id, reload }, { getState }): Promise<MaybeEntity> => {

    const follower = id as AccountId
    const knownAccountIds = selectAccountIdsByFollower(getState(), follower)
    const isKnownFollower = typeof knownAccountIds !== 'undefined'
    if (!reload && isKnownFollower) {
      // Nothing to load: account ids followed by this account are already loaded.
      return undefined
    }

    const readyApi = await api.substrate.api
    const accountIds = await readyApi.query.profileFollows
      .accountsFollowedByAccount(follower) as unknown as GenericAccountId[]

    return {
      id: follower,
      followingAccountIds: accountIds.map(x => x.toString())
    }
  }
)

const slice = createSlice({
  name: 'followedAccountIds',
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchEntityOfAccountIdsByFollower.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  }
})

export default slice.reducer
