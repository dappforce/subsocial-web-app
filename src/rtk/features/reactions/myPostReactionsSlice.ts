import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { getFirstOrUndefined, isDef, isEmptyArray, isEmptyStr } from '@subsocial/utils'
import { createSelectUnknownIds, FetchManyArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectManyFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, PostId, ReactionType } from 'src/types'
import { idToPostId } from 'src/types/utils'

const SEPARATOR = '-'

export type ReactionId = string

export type Reaction = {
  reactionId?: ReactionId
  kind?: ReactionType
}

type AccountAndPostId = string

export type ReactionStruct = Reaction & {
  id: AccountAndPostId
}

type Args = {
  myAddress?: AccountId
}

type PrependProps = Args & {
  ids: EntityId[],
}

export const prependPostIdWithMyAddress = (postId: EntityId, myAddress: AccountId) => 
  myAddress + SEPARATOR + postId

const prependPostIdsWithMyAddress = ({ ids: postIds, myAddress }: PrependProps) =>
  myAddress ? postIds.map(postId => prependPostIdWithMyAddress(postId, myAddress)) : [] 

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

export const selectMyPostReactionsByPostIds:
  SelectManyFn<Args, ReactionStruct> = (
    state, 
    args
  ) => {
    const reactions: ReactionStruct[] = []

    if (isEmptyStr(args.myAddress) || isEmptyArray(args.ids)) return []

    prependPostIdsWithMyAddress(args).forEach(id => {
      const reaction = selectMyReactionByPostId(state, id)

      if (reaction) {
        reactions.push(reaction)
      }
    })

    return reactions
  }

type PostIdAndMyAddress = {
  postId: PostId,
  myAddress?: AccountId
}

export const selectPostMyReactionByPostId = (state: RootState, { postId, myAddress }: PostIdAndMyAddress) => 
  getFirstOrUndefined(selectMyPostReactionsByPostIds(state, { ids: [ postId ], myAddress }))

export type FetchManyReactionsArgs = FetchManyArgs<Args>

export type FetchManyRes = ReactionStruct[]

export const selectUnknownPostIds = createSelectUnknownIds(selectPostIds)

export const fetchMyPostReactions = createAsyncThunk
  <FetchManyRes, FetchManyReactionsArgs, ThunkApiConfig>(
  'myPostReaction/fetchMany',
  async (args, { getState }): Promise<FetchManyRes> => {
    const { myAddress, api, reload } = args
    
    if (!myAddress) return []
 
    let newIds = prependPostIdsWithMyAddress(args) as string[]

    if (!reload) {
      newIds = selectUnknownPostIds(getState(), newIds)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their reactions are already loaded.
        return []
      }
    }

    const postIdByReactionId = new Map<string, string>()

    const reactionByPostId = new Map<string, ReactionStruct>()

    // TODO use multi query
    const promises = newIds.map(async accountAndPostId => {
      const [ , postId ] = accountAndPostId.split(SEPARATOR)
      const reactionId = await api.substrate.getPostReactionIdByAccount(myAddress, idToPostId(postId))
      reactionByPostId.set(postId, { id: prependPostIdWithMyAddress(postId, myAddress) })

      if (!reactionId.eqn(0)) {
        postIdByReactionId.set(reactionId.toString(), postId)

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
        id: prependPostIdWithMyAddress(postId, myAddress),
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
  removeAllMyPostReactions
} = slice.actions

export default slice.reducer
