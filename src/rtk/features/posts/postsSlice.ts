import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { PostContent } from '@subsocial/types'
import { ApiAndIds, createFetchOne, createFilterNewIds, idsToBns, selectOneById, selectManyByIds, ThunkApiConfig } from 'src/rtk/app/helpers'
import { getContentIds, NormalizedPost, normalizePostStructs } from 'src/rtk/app/normalizers'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { FullProfile } from '../profiles/profilesSlice'
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

const _selectPostById = (state: RootState, id: EntityId) =>
  selectOneById(state, id, selectPostStructById, selectPostContentById)

const _selectPostsByIds = (state: RootState, ids: EntityId[]) =>
  selectManyByIds(state, ids, selectPostStructById, selectPostContentById)

type SelectPostsProps = {
  ids: EntityId[],
  withSpace?: boolean,
  withOwner?: boolean,
}

export function selectPosts (state: RootState, props: SelectPostsProps): FullPost[] {
  const { ids, withSpace = true, withOwner = true } = props
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
  withContent?: boolean,
  withSpace?: boolean,
}

export const fetchPosts = createAsyncThunk<NormalizedPost[], FetchPostsArgs, ThunkApiConfig>(
  'posts/fetchMany',
  async ({ api, ids, withContent = true, withSpace = true }, { getState, dispatch }) => {

    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their posts are already loaded.
      return []
    }

    const structs = await api.substrate.findPosts({ ids: idsToBns(newIds) })
    const entities = normalizePostStructs(structs)

    if (withSpace) {
      const spaceIds = getUniqueSpaceIds(entities)
      if (spaceIds.length) {
        await dispatch(fetchSpaces({ api, ids: spaceIds }))
      }
    }

    if (withContent) {
      const cids = getContentIds(entities)
      if (cids.length) {
        // TODO combine fetch of spaces' and posts' contents into one dspatch.
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
