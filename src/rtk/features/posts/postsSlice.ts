import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { createFetchOne, createFilterNewIds, FetchManyArgs, /* FetchOneArgs, */ HasHiddenVisibility, SelectManyArgs, selectManyByIds, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { flattenPostStructs, getUniqueContentIds, getUniqueOwnerIds, getUniqueSpaceIds, PostStruct, PostWithSomeDetails, ProfileData, SpaceData } from 'src/types'
import { idsToBns } from 'src/types/utils'
import { fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { fetchProfiles, selectProfiles } from '../profiles/profilesSlice'
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
type FetchPostsArgs = FetchManyArgs<Args>

// TODO apply visibility filter
export function selectPosts (state: RootState, props: SelectPostsArgs): PostWithSomeDetails[] {
  const { ids, withOwner = true, withSpace = true } = props
  const posts = _selectPostsByIds(state, ids)
  
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
    const spaceIds = getUniqueSpaceIds(posts)
    const spaces = selectSpaces(state, { ids: spaceIds, ...withSpaceOwner })
    spaces.forEach(space => {
      spaceByIdMap.set(space.id, space)
    })
  }
  
  const result: PostWithSomeDetails[] = []
  posts.forEach(post => {
    const { ownerId, spaceId } = post.struct

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

    // TODO select post ext

    result.push({ id: post.id, /* TODO ext, */ post, owner, space })
  })
  return result
}

const filterNewIds = createFilterNewIds(selectPostIds)

export const fetchPosts = createAsyncThunk<PostStruct[], FetchPostsArgs, ThunkApiConfig>(
  'posts/fetchMany',
  async (args, { getState, dispatch }) => {
    const { api, ids, withContent = true, withOwner = true, withSpace = true } = args

    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their posts are already loaded.
      return []
    }

    const structs = await api.substrate.findPosts({ ids: idsToBns(newIds) })
    const entities = flattenPostStructs(structs)
    const fetches: Promise<any>[] = []

    // TODO fetch shared post or comment

    if (withSpace) {
      const ids = getUniqueSpaceIds(entities)
      if (ids.length) {
        fetches.push(dispatch(fetchSpaces({ api, ids, ...withSpaceOwner })))
      }
    }

    if (withOwner) {
      const ids = getUniqueOwnerIds(entities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' owners into one dispatch.
        fetches.push(dispatch(fetchProfiles({ api, ids })))
      }
    }

    if (withContent) {
      const ids = getUniqueContentIds(entities)
      if (ids.length) {
        // TODO combine fetch of spaces' and posts' contents into one dispatch.
        fetches.push(dispatch(fetchContents({ api, ids })))
      }
    }

    await Promise.all(fetches)

    return entities
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
