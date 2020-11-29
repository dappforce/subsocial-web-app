import { AsyncThunk, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { CommentContent, CommonContent, PostContent, ProfileContent, SharedPostContent, SpaceContent } from '@subsocial/types'
import { ApiAndIds, createFilterNewIds, SelectByIdFn, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { HasId } from 'src/types'

/** Content with id */
type Content<C extends CommonContent = CommonContent> = HasId & C

type SelectByIdResult<C extends CommonContent> = SelectByIdFn<Content<C>>

const contentsAdapter = createEntityAdapter<Content>()

const contentsSelectors = contentsAdapter.getSelectors<RootState>(state => state.contents)

const { selectById } = contentsSelectors

export const selectProfileContentById = selectById as SelectByIdResult<ProfileContent>
export const selectSpaceContentById = selectById as SelectByIdResult<SpaceContent>
export const selectPostContentById = selectById as SelectByIdResult<PostContent>
export const selectCommentContentById = selectById as SelectByIdResult<CommentContent>
export const selectSharedPostContentById = selectById as SelectByIdResult<SharedPostContent>

// Rename the exports for readability in component usage
export const {
  // selectById: selectContentById,
  selectIds: selectContentIds,
  selectEntities: selectContentEntities,
  selectAll: selectAllContents,
  selectTotal: selectTotalContents
} = contentsSelectors

const filterNewIds = createFilterNewIds(selectContentIds)

type FetchContentFn<C extends CommonContent> = AsyncThunk<Content<C>[], ApiAndIds, ThunkApiConfig>

export const fetchContents = createAsyncThunk<Content[], ApiAndIds, ThunkApiConfig>(
  'contents/fetchMany',
  async ({ api, ids }, { getState }) => {

    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their contents are already loaded.
      return []
    }

    const contents = await api.ipfs.getContentArray(newIds as string[])
    return Object.entries(contents)
      .map(([ id, content ]) => ({ id, ...content }))
  }
)

export const fetchProfileContents = fetchContents as FetchContentFn<ProfileContent>
export const fetchSpaceContents = fetchContents as FetchContentFn<SpaceContent>
export const fetchPostContents = fetchContents as FetchContentFn<PostContent>
export const fetchCommentContents = fetchContents as FetchContentFn<CommentContent>
export const fetchSharedPostContents = fetchContents as FetchContentFn<SharedPostContent>

// export const fetchContent = createFetchOne(fetchContents)

const contents = createSlice({
  name: 'contents',
  initialState: contentsAdapter.getInitialState(),
  reducers: {
    updateContent: contentsAdapter.updateOne
  },
  extraReducers: builder => {
    builder.addCase(fetchContents.fulfilled, contentsAdapter.upsertMany)
    // builder.addCase(fetchContents.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export default contents.reducer
