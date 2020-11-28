import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { PostContent } from '@subsocial/types'
import { ApiAndIds, createFetchOne, createFilterNewIds, idsToBns, selectOneById, selectManyByIds, ThunkApiConfig } from 'src/rtk/app/helpers'
import { getUniqueContentIds, getUniqueIds, getUniqueOwnerIds, NormalizedPost, normalizePostStructs } from 'src/rtk/app/normalizers'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { fetchProfiles, FullProfile } from '../profiles/profilesSlice'
import { fetchSpaces, FullSpace, selectSpacesByIds } from '../spaces/spacesSlice'

export type FullPost = Omit<NormalizedPost, 'owner'> & PostContent & {
  space?: FullSpace
  owner?: FullProfile // or 'ownerProfile'?
}

const postsAdapter = createEntityAdapter<NormalizedPost>()

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

type SelectPostsProps = {
  ids: EntityId[]
  withOwner?: boolean
  withSpace?: boolean
}

export function selectPosts (state: RootState, props: SelectPostsProps): FullPost[] {
  const { ids, withOwner = true, withSpace = true } = props
  const posts = _selectPostsByIds(state, ids)
  
  const ownerByIdMap = new Map<EntityId, FullProfile>()
  if (withOwner) {
    // TODO impl
  }

  const spaceByIdMap = new Map<EntityId, FullSpace>()
  if (withSpace) {
    const spaceIds = getUniqueSpaceIds(posts)
    const spaces = selectSpacesByIds(state, spaceIds)
    spaces.forEach(space => {
      spaceByIdMap.set(space.id, space)
    })
  }
  
  const result: FullPost[] = []
  posts.forEach(post => {
    let space: FullSpace | undefined
    const { spaceId } = post
    if (spaceId) {
      space = spaceByIdMap.get(spaceId)
    }

    let owner: FullProfile | undefined
    if (post.owner) {
      owner = ownerByIdMap.get(post.owner)
    }

    result.push({ ...post, owner, space })
  })
  return result
}

const getUniqueSpaceIds = (posts: NormalizedPost[]) => getUniqueIds(posts, 'spaceId')

const filterNewIds = createFilterNewIds(selectPostIds)

type FetchPostsArgs = ApiAndIds & {
  withContent?: boolean
  withOwner?: boolean
  withSpace?: boolean
}

export const fetchPosts = createAsyncThunk<NormalizedPost[], FetchPostsArgs, ThunkApiConfig>(
  'posts/fetchMany',
  async (args, { getState, dispatch }) => {
    const { api, ids, withContent = true, withOwner = true, withSpace = true } = args

    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their posts are already loaded.
      return []
    }

    const structs = await api.substrate.findPosts({ ids: idsToBns(newIds) })
    const entities = normalizePostStructs(structs)
    const fetches: Promise<any>[] = []

    // TODO fetch shared post or comment

    if (withSpace) {
      const ids = getUniqueSpaceIds(entities)
      if (ids.length) {
        fetches.push(dispatch(fetchSpaces({ api, ids })))
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
