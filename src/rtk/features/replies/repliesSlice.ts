import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isEmptyArray } from '@subsocial/utils'
import { createSelectUnknownIds, FetchManyArgs, SelectManyArgs, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { bnsToIds, idToBn, PostId, PostWithSomeDetails } from 'src/types'
import { selectPosts } from '../posts/postsSlice'

export type ReplyIdsByPostId = {
  /** `id` is a parent id of replies. */
  id: PostId
  replyIds: PostId[]
}

export type RepliesByPostIdMap = Record<PostId, PostWithSomeDetails[]>

const replyIdsAdapter = createEntityAdapter<ReplyIdsByPostId>()

const replyIdsSelectors = replyIdsAdapter.getSelectors<RootState>(state => state.replyIds)

// Rename the exports for readability in component usage
export const {
  selectById: selectReplyIds,
  selectIds: selectParentIds,
  selectEntities: selectReplyIdsEntities,
  selectAll: selectAllReplyIds,
  selectTotal: selectTotalParentIds
} = replyIdsSelectors

type Args = {}

export type SelectOnePostRepliesArgs = SelectOneArgs<Args>
export type SelectManyPostRepliesArgs = SelectManyArgs<Args>

type FetchManyPostRepliesArgs = FetchManyArgs<Args>

const selectUnknownParentIds = createSelectUnknownIds(selectParentIds)

export function selectManyReplyIds (state: RootState, { ids: parentIds }: SelectManyPostRepliesArgs): ReplyIdsByPostId[] {
  if (isEmptyArray(parentIds)) return []

  const uniqueParentIds = new Set(parentIds)
  return selectAllReplyIds(state)
    .filter(({ id: parentId }) => uniqueParentIds.has(parentId))
}

export function selectManyPostReplies (state: RootState, { ids: parentIds }: SelectManyPostRepliesArgs): RepliesByPostIdMap {
  const replyIds = selectManyReplyIds(state, { ids: parentIds })
  
  if (!replyIds.length) return {}

  const res: RepliesByPostIdMap = {}
  replyIds.forEach(({ id: parentId, replyIds }) => {
    const replies = selectPosts(state, { ids: replyIds, withSpace: false })
    res[parentId] = replies
  })

  return res
}

export function selectOnePostReplies (state: RootState, { id: parentId }: SelectOnePostRepliesArgs): PostWithSomeDetails[] {
  return selectManyPostReplies(state, { ids: [ parentId ]})[parentId] || []
}

export const fetchPostReplyIds = createAsyncThunk<ReplyIdsByPostId[], FetchManyPostRepliesArgs, ThunkApiConfig>(
  'replyIds/fetchMany',
  async (args, { getState }) => {
    const { api, ids: _parentIds } = args
    
    const parentIds = selectUnknownParentIds(getState(), _parentIds)
    if (!parentIds.length) {
      // Nothing to load: all ids are known and their replyIds are already loaded.
      return []
    }
    
    const calls = parentIds.map((id) => api.substrate.getReplyIdsByPostId(idToBn(id)))
    const results = await Promise.all(calls)
  
    return results.map((bnIds, i) => {
      return {
        id: parentIds[i],
        replyIds: bnsToIds(bnIds)
      }
    })
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
    builder.addCase(fetchPostReplyIds.fulfilled, replyIdsAdapter.upsertMany)
  }
})

export const {
  upsertReplyIdsByPostId,
  removeReplyIdsByPostId,
} = replyIds.actions

export default replyIds.reducer
