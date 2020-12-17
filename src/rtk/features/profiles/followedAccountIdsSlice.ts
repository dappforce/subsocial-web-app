import { GenericAccountId } from '@polkadot/types'
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId } from 'src/types'

export type AccountIdsFollowedByAccount = {
  /** `id` is an account id that follows accounts. */
  id: AccountId
  followedAccountIds: AccountId[]
}

const adapter = createEntityAdapter<AccountIdsFollowedByAccount>()

const selectors = adapter.getSelectors<RootState>(state => state.followedAccountIds)

// Rename the exports for readability in component usage
export const {
  // selectById: selectAccountIdsFollowedByAccount,
  selectIds: selectAllAccountFollowers,
  // selectEntities: selectFollowedAccountIdsEntities,
  // selectAll: selectAllFollowedAccountIds,
  // selectTotal: selectTotalAccountFollowers
} = selectors

export const _selectAccountIdsFollowedByAccount:
  SelectOneFn<Args, AccountIdsFollowedByAccount | undefined> = (
    state, 
    { id: follower }
  ) =>
    selectors.selectById(state, follower)

export const selectAccountIdsFollowedByAccount = (state: RootState, id: AccountId) => 
  _selectAccountIdsFollowedByAccount(state, { id })?.followedAccountIds

type Args = {
  reload?: boolean
}

type FetchOneAccountIdsArgs = FetchOneArgs<Args>

type FetchOneRes = AccountIdsFollowedByAccount | undefined

export const fetchAccountIdsFollowedByAccount = createAsyncThunk
  <FetchOneRes, FetchOneAccountIdsArgs, ThunkApiConfig>(
  'followedAccountIds/fetchOne',
  async ({ api, id, reload }, { getState }): Promise<FetchOneRes> => {

    const follower = id as AccountId
    const knownAccountIds = selectAccountIdsFollowedByAccount(getState(), follower)
    const isKnownFollower = typeof knownAccountIds !== 'undefined'
    if (!reload && isKnownFollower) {
      // Nothing to load: space ids followed by this account are already loaded.
      return undefined
    }
    const readyApi = await api.substrate.api
    const accountIds = await readyApi.query.profileFollows.accountsFollowedByAccount(follower) as unknown as GenericAccountId[]
    console.log('accountIds', accountIds)
    return {
      id: follower,
      followedAccountIds: accountIds.map(x => x.toString())
    }
  }
)

const slice = createSlice({
  name: 'followedAccountIds',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertFollowedAccountIdsByAccount: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchAccountIdsFollowedByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  }
})

export const {
  upsertFollowedAccountIdsByAccount,
} = slice.actions

export default slice.reducer
