import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { PostContent } from '@subsocial/types'
import { nonEmptyArr } from '@subsocial/utils'
import { ApiAndIds, createFetchOne, createFilterNewIds, idsToBns, selectOneById, selectManyByIds, ThunkApiConfig, createFetchMany } from 'src/rtk/app/helpers'
import { getContentIds, NormalizedPost, normalizePostStructs } from 'src/rtk/app/normalizers'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { fetchSpaces, FullSpace, selectSpaceById, selectSpacesByIds } from '../spaces/spacesSlice'

export type FullPost = NormalizedPost & PostContent

export type FullPostWithSpace = FullPost & { space?: FullSpace }

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

export const selectPostById = (state: RootState, id: EntityId): FullPost | undefined =>
  selectOneById(state, id, selectPostStructById, selectPostContentById)

export const selectPostsByIds = (state: RootState, ids: EntityId[]): FullPost[] =>
  selectManyByIds(state, ids, selectPostStructById, selectPostContentById)

export function selectPostsWithSpaces (state: RootState, ids: EntityId[]): FullPostWithSpace[] {
  const posts = selectPostsByIds(state, ids)
  
  const spaceIds = getUniqueSpaceIds(posts)
  const spaces = selectSpacesByIds(state, spaceIds)
  const spaceByIdMap = new Map<EntityId, FullSpace>()
  spaces.forEach(space => {
    spaceByIdMap.set(space.id, space)
  })

  const result: FullPostWithSpace[] = []
  posts.forEach(post => {
    let space: FullSpace | undefined
    const { spaceId } = post
    if (spaceId) {
      space = spaceByIdMap.get(spaceId)
    }
    result.push({ ...post, space })
  })
  return result
}

function getUniqueSpaceIds (posts: NormalizedPost[]): EntityId[] {
  const spaceIds = new Set<EntityId>()
  posts.forEach(({ spaceId }) => {
    if (spaceId && !spaceIds.has(spaceId)) {
      spaceIds.add(spaceId)
    }
  })
  return Array.from(spaceIds)
}

const filterNewIds = createFilterNewIds(selectPostIds)

type FetchPostsArgs = ApiAndIds & {
  withContents?: boolean,
  withSpaces?: boolean,
}

export const fetchPosts = createAsyncThunk<NormalizedPost[], FetchPostsArgs, ThunkApiConfig>(
  'posts/fetchMany',
  async ({ api, ids, withContents = true, withSpaces = true }, { getState, dispatch }) => {

    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their posts are already loaded.
      return []
    }

    const structs = await api.substrate.findPosts({ ids: idsToBns(newIds) })
    const entities = normalizePostStructs(structs)

    if (withSpaces) {
      const spaceIds = getUniqueSpaceIds(entities)
      if (spaceIds.length) {
        await dispatch(fetchSpaces({ api, ids: spaceIds }))
      }
    }

    if (withContents) {
      const cids = getContentIds(entities)
      if (nonEmptyArr(cids)) {
        // TODO combine fetch of space and post contents into one dspatch.
        await dispatch(fetchContents({ api, ids: cids }))
      }
    }

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
