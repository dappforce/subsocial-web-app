import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { getFirstOrUndefined, isDef, isEmptyArray, isEmptyStr } from '@subsocial/utils'
import { createSelectUnknownIds, FetchManyArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectManyFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, PostId, ReactionId, ReactionType } from 'src/types'
import { idToPostId } from 'src/types/utils'

const sliceName = 'reactions'

const idSeparator = '-'

export type Reaction = {
  reactionId?: ReactionId
  kind?: ReactionType
}

// A composite entity id: account_id + '-' + post_id
type AccountAndPostId = string

export type ReactionStruct = Reaction & {
  id: AccountAndPostId
}

type Args = {
  myAddress?: AccountId
}

type PrependParams = Args & {
  ids: EntityId[],
}

export const prependPostIdWithMyAddress = (postId: EntityId, myAddress: AccountId) => 
  myAddress + idSeparator + postId

const prependPostIdsWithMyAddress = ({ ids: postIds, myAddress }: PrependParams) =>
  myAddress ? postIds.map(postId => prependPostIdWithMyAddress(postId, myAddress)) : [] 

const adapter = createEntityAdapter<ReactionStruct>()

const selectors = adapter.getSelectors<RootState>(state => state.myPostReactions)

// Rename for readability
const {
  selectIds: selectAllEntityIds,
} = selectors

export const selectMyReactionsByPostIds: SelectManyFn<Args, ReactionStruct> =
  (state, { myAddress, ids: postIds }) => {
    if (!myAddress || isEmptyStr(myAddress) || isEmptyArray(postIds)) return []

    const reactions: ReactionStruct[] = []

    postIds.forEach((postId) => {
      const compositeId = prependPostIdWithMyAddress(postId, myAddress)
      const reaction = selectors.selectById(state, compositeId)
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

export const selectMyReactionByPostId = (state: RootState, { postId, myAddress }: PostIdAndMyAddress) => 
  getFirstOrUndefined(selectMyReactionsByPostIds(state, { ids: [ postId ], myAddress }))

type FetchManyReactionsArgs = FetchManyArgs<Args>

type FetchManyResult = ReactionStruct[]

const selectUnknownEntityIds = createSelectUnknownIds(selectAllEntityIds)

export const fetchMyReactionsByPostIds = createAsyncThunk
  <FetchManyResult, FetchManyReactionsArgs, ThunkApiConfig>(
  `${sliceName}/fetchMany`,
  async (args, { getState }): Promise<FetchManyResult> => {
    const { myAddress, api, reload } = args
    
    if (!myAddress) return []
 
    let newIds = prependPostIdsWithMyAddress(args)

    if (!reload) {
      newIds = selectUnknownEntityIds(getState(), newIds)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their reactions are already loaded.
        return []
      }
    }

    const postIdByReactionId = new Map<ReactionId, PostId>()
    const reactionByPostId = new Map<PostId, ReactionStruct>()

    // TODO use multi query
    const promises = newIds.map(async accountAndPostId => {
      const [ /* account */, postId ] = accountAndPostId.split(idSeparator)
      const reactionId = await api.substrate.getPostReactionIdByAccount(myAddress, idToPostId(postId))
      const entityId = prependPostIdWithMyAddress(postId, myAddress)
      reactionByPostId.set(postId, { id: entityId })

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
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    upsertMyReaction: adapter.upsertOne,
    // removeAllReactions: adapter.removeAll
  },
  extraReducers: builder => {
    builder.addCase(fetchMyReactionsByPostIds.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload)
    })
  }
})

export const {
  upsertMyReaction,
  // removeAllReactions
} = slice.actions

export default slice.reducer
