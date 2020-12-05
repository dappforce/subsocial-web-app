import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { createFilterNewIds, FetchManyArgs, SelectManyArgs, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { bnsToIds, HasId, idsToBns, PostId } from 'src/types'

export type ReplyIdsByPostId = HasId & {
  replyIds: PostId[]
}

const replyIdsAdapter = createEntityAdapter<ReplyIdsByPostId>()

const replyIdsSelectors = replyIdsAdapter.getSelectors<RootState>(state => state.replyIds)

// Rename the exports for readability in component usage
export const {
  selectById: selectReplyIds,
  selectIds: selectReplyIdsIds,
  selectEntities: selectReplyIdsEntities,
  selectAll: selectAllReplyIds,
  selectTotal: selectTotalReplyIds
} = replyIdsSelectors

type Args = {}

export type SelectManyReplyIdsArgs = SelectManyArgs<Args>
export type SelectOneReplyIdsArgs = SelectOneArgs<Args>

type FetchManyReplyIdsArgs = FetchManyArgs<Args>

const filterNewIds = createFilterNewIds(selectReplyIdsIds)

export function selectManyReplyIds (state: RootState, props: SelectManyReplyIdsArgs): ReplyIdsByPostId[] {
  const ids = new Set(props.ids)

  return selectAllReplyIds(state)
    .filter(({ id }) => ids.has(id))
}

export const fetchManyReplyIds = createAsyncThunk<ReplyIdsByPostId[], FetchManyReplyIdsArgs, ThunkApiConfig>(
  'replyIds/fetchMany',
  async (args, { getState }) => {
    const { api, ids: _ids } = args
    
    const ids = _ids.map(x => x.toString())
    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their replyIds are already loaded.
      return []
    }
    
    const parentIds = idsToBns(ids)
    // const replyIds = await api.substrate.getReplyIdsByPostId(parentIds[0])
    // return [ {
    //   id: ids[0],
    //   replyIds: bnsToIds(replyIds)
    // } ]
    const calls = parentIds.map(id => api.substrate.getReplyIdsByPostId(id))
    const results = await Promise.all(calls)

    return results.map((replyIds, i) => ({
      id: ids[i],
      replyIds: bnsToIds(replyIds)
    }))
  }
)

const replyIds = createSlice({
  name: 'replyIds',
  initialState: replyIdsAdapter.getInitialState(),
  reducers: {
    upsertReplyIdsByPostId: replyIdsAdapter.upsertOne,
    removeReplyIdsByPostId: replyIdsAdapter.removeOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchManyReplyIds.fulfilled, replyIdsAdapter.upsertMany)
  }
})

export const {
  upsertReplyIdsByPostId,
  removeReplyIdsByPostId,
} = replyIds.actions

export default replyIds.reducer
