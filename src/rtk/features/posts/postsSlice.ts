import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { ApiAndIds, createFetchOne, createFilterNewIds, idsToBns, selectManyByIds, ThunkApiConfig } from 'src/rtk/app/helpers'
import { getUniqueContentIds, getUniqueIds, getUniqueOwnerIds, PostStruct, flattenPostStructs } from 'src/rtk/app/flatteners'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { fetchProfiles, selectProfiles } from '../profiles/profilesSlice'
import { fetchSpaces, selectSpaces } from '../spaces/spacesSlice'
import { PostData, PostWithSomeDetails, ProfileData, SpaceData } from 'src/rtk/app/dto'

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

type SelectArgs = {
  ids: EntityId[]
  withOwner?: boolean
  withSpace?: boolean
}

export function selectPosts (state: RootState, props: SelectArgs): PostWithSomeDetails[] {
  const { ids, withOwner = true, withSpace = true } = props
  const posts = _selectPostsByIds(state, ids)
  
  // TODO Fix copypasta. Places: selectSpaces & selectPosts
  const ownerByIdMap = new Map<EntityId, ProfileData>()
  if (withOwner) {
    const ownerIds = getUniqueOwnerIds(posts)
    const profiles = selectProfiles(state, ownerIds)
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

    result.push({ id: post.id, post, owner, space })
  })
  return result
}

const getUniqueSpaceIds = (posts: PostData[] | PostStruct[]) => getUniqueIds(posts, 'spaceId')

const filterNewIds = createFilterNewIds(selectPostIds)

type FetchArgs = ApiAndIds & {
  withContent?: boolean
  withOwner?: boolean
  withSpace?: boolean
}

export const fetchPosts = createAsyncThunk<PostStruct[], FetchArgs, ThunkApiConfig>(
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
    updatePost: postsAdapter.updateOne
  },
  extraReducers: builder => {
    builder.addCase(fetchPosts.fulfilled, postsAdapter.upsertMany)
    // builder.addCase(fetchPosts.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export default posts.reducer
