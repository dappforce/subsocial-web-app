import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'src/rtk/app/rootReducer'
import { ReplyIdsByPostId } from 'src/types'

const replyIdsByPostIdAdapter = createEntityAdapter<ReplyIdsByPostId>()

const replyIdsByPostIdSelectors = replyIdsByPostIdAdapter.getSelectors<RootState>(state => state.replyIdsByPostId)

// Rename the exports for readability in component usage
export const {
  selectById: selectReplyIdsByParentId,
  selectIds: selectReplyIdsByPostId,
  selectEntities: selectReplyIdsEntities,
  selectAll: selectAllReplyIds,
  selectTotal: selectTotalReplyIds
} = replyIdsByPostIdSelectors

const replyIdsByPostId = createSlice({
  name: 'replyIdsByPostId',
  initialState: replyIdsByPostIdAdapter.getInitialState(),
  reducers: {
    upsertReplyIdsByPostId: replyIdsByPostIdAdapter.upsertOne,
    removeReplyIdsByPostId: replyIdsByPostIdAdapter.removeOne,
  },
})

export const {
  upsertReplyIdsByPostId,
  removeReplyIdsByPostId,
} = replyIdsByPostId.actions

export default replyIdsByPostId.reducer
