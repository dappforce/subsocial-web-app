import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getFirstOrUndefined, isDef } from '@subsocial/utils'
import { createSelectUnknownIds, FetchManyArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectManyFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, PostId } from 'src/types'
import { idToPostId } from 'src/types/utils'

export enum ReactionEnum {
  Upvote = 'Upvote',
  Downvote = 'Downvote'
}

export type ReactionId = string
export type ReactionType = 'Upvote' | 'Downvote'

export type Reaction = {
  reactionId?: ReactionId
  kind?: ReactionType
}

export type ReactionStruct = Reaction & {
  id: PostId
}

const adapter = createEntityAdapter<ReactionStruct>()

const selectors = adapter.getSelectors<RootState>(state => state.postReactions)

// Rename the exports for readability in component usage
export const {
  selectById: selectReactionByPostId,
  selectIds: selectPostIds,
  // selectEntities: selectFollowedSpaceIdsEntities,
  // selectAll: selectAllFollowedSpaceIds,
  // selectTotal: selectTotalSpaceFollowers
} = selectors

export const selectPostReactionsByPostIds:
  SelectManyFn<{}, ReactionStruct> = (
    state, 
    { ids }
  ) => {
    const reactions: ReactionStruct[] = []
  
    ids.forEach(id => {
      const reaction = selectReactionByPostId(state, id)

      if (reaction) {
        reactions.push(reaction)
      }
    })

    return reactions
  }

export const selectPostReactionByPostId = (state: RootState, id: PostId) => 
  getFirstOrUndefined(selectPostReactionsByPostIds(state, { ids: [ id ] }))

type Args = {
  myAddress?: AccountId
}

export type FetchManyReactionsArgs = FetchManyArgs<Args>

export type FetchManyRes = ReactionStruct[]

export const selectUnknownPostIds = createSelectUnknownIds(selectPostIds)

export const fetchPostReactions = createAsyncThunk
  <FetchManyRes, FetchManyReactionsArgs, ThunkApiConfig>(
  'postReactionByAccount/fetchMany',
  async ({ api, ids, myAddress, reload }, { getState }): Promise<FetchManyRes> => {
 
    let newIds = ids as string[]

    if (!reload || !myAddress) {
      newIds = selectUnknownPostIds(getState(), ids)
      if (!newIds.length || !myAddress) {
        // Nothing to load: all ids are known and their posts are already loaded.
        return []
      }
    }


    const postIdByReactionId = new Map<string, string>()

    const reactionByPostId = new Map<string, ReactionStruct>()

    // TODO use multi query
    const promises = newIds.map(async postId => {
      const reactionId = await api.substrate.getPostReactionIdByAccount(myAddress, idToPostId(postId))
      const reactionIdNum = reactionId.toNumber()
      reactionByPostId.set(postId, { id: postId })

      if (reactionIdNum) {
        postIdByReactionId.set(reactionIdNum.toString(), postId)

        return reactionId
      }

      return undefined
    })
  
    const reactionIds = await Promise.all(promises)

    const entities = await api.substrate.findReactions(reactionIds.filter(isDef))
    
    entities.forEach(({ kind: kindCodec, id }) => {
      const reactionId = id.toString()
      const postId = postIdByReactionId.get(reactionId)

      const kind = kindCodec.toString() as ReactionType
      const reaction = kind
        ? {
          reactionId,
          kind
        }
        : undefined
  
      postId && reactionByPostId.set(postId, {
        id: postId,
        ...reaction
      })

    })

    return Array.from(reactionByPostId.values())
  }
)

const slice = createSlice({
  name: 'postReactionByAccount',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertPostReaction: adapter.upsertOne,
    removePostReaction: adapter.removeOne,
    removeAllReaction: adapter.removeAll
  },
  extraReducers: builder => {
    builder.addCase(fetchPostReactions.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload)
    })
  }
})

export const {
  upsertPostReaction,
  removePostReaction,
  removeAllReaction
} = slice.actions

export default slice.reducer
