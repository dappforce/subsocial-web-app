import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getFirstOrUndefined, isDef } from '@subsocial/utils'
import { createSelectUnknownIds, FetchManyArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectManyFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, PostId, ReactionType } from 'src/types'
import { idToPostId } from 'src/types/utils'

export type ReactionId = string

export type Reaction = {
  reactionId?: ReactionId
  kind?: ReactionType
}

export type ReactionStruct = Reaction & {
  id: PostId
}

const adapter = createEntityAdapter<ReactionStruct>()

const selectors = adapter.getSelectors<RootState>(state => state.myPostReactions)

// Rename the exports for readability in component usage
export const {
  selectById: selectMyReactionByPostId,
  selectIds: selectPostIds,
  // selectEntities,
  // selectAll,
  // selectTotal
} = selectors

export const selectPostMyReactionsByPostIds:
  SelectManyFn<{}, ReactionStruct> = (
    state, 
    { ids }
  ) => {
    const reactions: ReactionStruct[] = []
  
    ids.forEach(id => {
      const reaction = selectMyReactionByPostId(state, id)

      if (reaction) {
        reactions.push(reaction)
      }
    })

    return reactions
  }

export const selectPostMyReactionByPostId = (state: RootState, id: PostId) => 
  getFirstOrUndefined(selectPostMyReactionsByPostIds(state, { ids: [ id ] }))

type Args = {
  myAddress?: AccountId
}

export type FetchManyReactionsArgs = FetchManyArgs<Args>

export type FetchManyRes = ReactionStruct[]

export const selectUnknownPostIds = createSelectUnknownIds(selectPostIds)

export const fetchMyPostReactions = createAsyncThunk
  <FetchManyRes, FetchManyReactionsArgs, ThunkApiConfig>(
  'myPostReaction/fetchMany',
  async ({ api, ids, myAddress, reload }, { getState }): Promise<FetchManyRes> => {

    if (!myAddress) return []
 
    let newIds = ids as string[]

    if (!reload) {
      newIds = selectUnknownPostIds(getState(), ids)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their reactions are already loaded.
        return []
      }
    }


    const postIdByReactionId = new Map<string, string>()

    const reactionByPostId = new Map<string, ReactionStruct>()

    // TODO use multi query
    const promises = newIds.map(async postId => {
      const reactionId = await api.substrate.getPostReactionIdByAccount(myAddress, idToPostId(postId))
      const reactionIdStr = reactionId.toString()
      reactionByPostId.set(postId, { id: postId })

      if (reactionIdStr !== '0') {
        postIdByReactionId.set(reactionIdStr, postId)

        return reactionId
      }

      return undefined
    })
  
    const reactionIds = await Promise.all(promises)

    const entities = await api.substrate.findReactions(reactionIds.filter(isDef))
    
    entities.forEach(({ kind: kindCodec, id }) => {
      const reactionId = id.toString()
      const postId = postIdByReactionId.get(reactionId)
  
      postId && reactionByPostId.set(postId, {
        id: postId,
        reactionId,
        kind: kindCodec.toString() as ReactionType
      })

    })

    return Array.from(reactionByPostId.values())
  }
)

const slice = createSlice({
  name: 'myPostReaction',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertMyPostReaction: adapter.upsertOne,
    removeMyPostReaction: adapter.removeOne,
    removeAllMyPostReactions: adapter.removeAll
  },
  extraReducers: builder => {
    builder.addCase(fetchMyPostReactions.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload)
    })
  }
})

export const {
  upsertMyPostReaction,
  removeMyPostReaction,
  removeAllMyPostReactions
} = slice.actions

export default slice.reducer
