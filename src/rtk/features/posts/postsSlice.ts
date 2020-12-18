import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { getFirstOrUndefined } from '@subsocial/utils'
import { createFetchOne, createSelectUnknownIds, FetchManyArgs, HasHiddenVisibility, SelectManyArgs, selectManyByIds, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, asCommentStruct, asSharedPostStruct, flattenPostStructs, getUniqueContentIds, getUniqueOwnerIds, getUniqueSpaceIds, PostId, PostStruct, PostWithSomeDetails, ProfileData, SpaceData } from 'src/types'
import { idsToBns } from 'src/types/utils'
import { fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { fetchProfiles, selectProfiles } from '../profiles/profilesSlice'
import { fetchPostReactions } from '../reactions/postReactionsSlice'
import { fetchSpaces, selectSpaces } from '../spaces/spacesSlice'

const postsAdapter = createEntityAdapter<PostStruct>()

const postsSelectors = postsAdapter.getSelectors<RootState>(state => state.posts)

// Rename the exports for readability in component usage
export const {
  selectById: selectPostStructById,
  selectIds: selectPostIds,
  selectEntities: selectPostEntities,
  selectAll: selectAllPosts,
  selectTotal: selectTotalPosts
} = postsSelectors

const _selectPostsByIds = (state: RootState, ids: EntityId[]) =>
  selectManyByIds(state, ids, selectPostStructById, selectPostContentById)

/** Should we fetch and select a space owner by default? */
const withSpaceOwner = { withOwner: false }

export type PostVisibility = HasHiddenVisibility

type Args = {
  visibility?: PostVisibility
  withContent?: boolean
  withOwner?: boolean
  withSpace?: boolean
}

export type SelectPostArgs = SelectOneArgs<Args>
export type SelectPostsArgs = SelectManyArgs<Args>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type FetchPostArgs = FetchOneArgs<Args>
type FetchPostsArgs = FetchManyArgs<Args & {
  myAddress?: AccountId
}>

type PostMap<D extends PostWithSomeDetails = PostWithSomeDetails> = Record<PostId, D>

export function selectPostMap
  <D extends PostWithSomeDetails = PostWithSomeDetails>
  (state: RootState, props: SelectPostsArgs): PostMap<D>
{
  const map: PostMap<D> = {}
  selectPosts(state, props).forEach((p) => map[p.id] = p as D)
  return map
}

// TODO apply visibility filter
export function selectPosts (state: RootState, props: SelectPostsArgs): PostWithSomeDetails[] {
  const { ids, withOwner = true, withSpace = true } = props
  const posts = _selectPostsByIds(state, ids)
  
  const rootPostIds = new Set<PostId>()

  posts.forEach(({ struct }) => {
    if (struct.isComment) {
      const { rootPostId } = asCommentStruct(struct)
      rootPostIds.add(rootPostId)
    }
  })

  const rootPosts = _selectPostsByIds(state, Array.from(rootPostIds))

  const postsMap = selectPostEntities(state)

  // TODO Fix copypasta. Places: selectSpaces & selectPosts
  const ownerByIdMap = new Map<EntityId, ProfileData>()
  if (withOwner) {
    const ownerIds = getUniqueOwnerIds(posts)
    const profiles = selectProfiles(state, { ids: ownerIds })
    profiles.forEach(profile => {
      ownerByIdMap.set(profile.id, profile)
    })
  }

  const spaceByIdMap = new Map<EntityId, SpaceData>()
  if (withSpace) {
    const spaceIds = getUniqueSpaceIds(posts.concat(rootPosts))

    const spaces = selectSpaces(state, { ids: spaceIds, ...withSpaceOwner })
    spaces.forEach(space => {
      spaceByIdMap.set(space.id, space)
    })
  }
  
  const result: PostWithSomeDetails[] = []
  posts.forEach(post => {
    const { struct } = post
    const { ownerId, spaceId, isComment, isSharedPost } = struct

    // TODO Fix copypasta. Places: selectSpaces & selectPosts
    let owner: ProfileData | undefined
    if (ownerId) {
      owner = ownerByIdMap.get(ownerId)
    }

    // TODO Fix copypasta. Places: selectSpaces & selectPosts
    let space: SpaceData | undefined
    if (spaceId) {
      space = spaceByIdMap.get(spaceId)
    }

    if (isComment) {
      const { rootPostId } = asCommentStruct(struct)
      const rootPost = postsMap[rootPostId]

      if (rootPost) {
        space = spaceByIdMap.get(rootPost.spaceId!)
      }
    }

    let ext: PostWithSomeDetails | undefined = undefined

    if (isSharedPost) {
      const { sharedPostId } = asSharedPostStruct(struct)
      ext = getFirstOrUndefined(selectPosts(state, { ids: [ sharedPostId ]}))
    }

    // TODO select post ext for comment (?) 

    result.push({ id: post.id, ext, post, owner, space })
  })
  return result
}

// TODO extract a generic function
export function selectPost (state: RootState, props: SelectPostArgs): PostWithSomeDetails | undefined {
  const { id, ...rest } = props
  const entities = selectPosts(state, { ids: [ id ], ...rest })
  return getFirstOrUndefined(entities)
}

export const selectUnknownPostIds = createSelectUnknownIds(selectPostIds)

export const fetchPosts = createAsyncThunk<PostStruct[], FetchPostsArgs, ThunkApiConfig>(
  'posts/fetchMany',
  async (args, { getState, dispatch }) => {
    const { api, ids, myAddress, withContent = true, withOwner = true, withSpace = true, reload } = args
 
    let newIds = ids as string[]

    if (!reload) {
      newIds = selectUnknownPostIds(getState(), ids)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their posts are already loaded.
        return []
      }
    }

    myAddress && dispatch(fetchPostReactions({ ids: newIds, myAddress, api }))

    const structs = await api.substrate.findPosts({ ids: idsToBns(newIds) })
    const entities = flattenPostStructs(structs)

    const alreadyLoadedIds = new Set(newIds)
    const extPostIds = new Set<PostId>()

    entities.forEach((x) => {
      if (x.isComment) {
        const { rootPostId } = asCommentStruct(x)
        if (reload || !alreadyLoadedIds.has(rootPostId)) {
          extPostIds.add(rootPostId)
        }
      }
      if (x.isSharedPost) {
        const { sharedPostId } = asSharedPostStruct(x)
        if (reload || !alreadyLoadedIds.has(sharedPostId)) {
          extPostIds.add(sharedPostId)
        }
      }
    })

    const newExtIds = selectUnknownPostIds(getState(), Array.from(extPostIds))
    const extStructs = await api.substrate.findPosts({ ids: idsToBns(newExtIds) })
    const extEntities = flattenPostStructs(extStructs)
    const allEntities = entities.concat(extEntities)

    const fetches: Promise<any>[] = []

    // TODO fetch shared post or comment

    if (withSpace) {
      const ids = getUniqueSpaceIds(allEntities)
      if (ids.length) {
        fetches.push(dispatch(fetchSpaces({ api, ids, ...withSpaceOwner })))
      }
    }

    if (withOwner) {
      const ids = getUniqueOwnerIds(allEntities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' owners into one dispatch.
        fetches.push(dispatch(fetchProfiles({ api, ids })))
      }
    }

    if (withContent) {
      const ids = getUniqueContentIds(allEntities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' contents into one dispatch.
        fetches.push(dispatch(fetchContents({ api, ids })))
      }
    }

    await Promise.all(fetches)

    return allEntities
  }
)

export const fetchPost = createFetchOne(fetchPosts)

const posts = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: {
    upsertPost: postsAdapter.upsertOne,
    upsertPosts: postsAdapter.upsertMany,
    removePost: postsAdapter.removeOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchPosts.fulfilled, postsAdapter.upsertMany)
    // builder.addCase(fetchPosts.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export const {
  upsertPost,
  upsertPosts,
  removePost
} = posts.actions

export default posts.reducer
