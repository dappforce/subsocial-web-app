import { AsyncThunk, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { HasId, CommentContent, CommonContent, PostContent, ProfileContent, SharedPostContent, SpaceContent, DerivedContent, convertToDerivedContent } from 'src/types'
import { ApiAndIds, createFetchOne, createSelectUnknownIds, SelectByIdFn, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

/** Content with id */
type Content<C extends CommonContent = CommonContent> = HasId & DerivedContent<C>

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

const selectUnknownContentIds = createSelectUnknownIds(selectContentIds)

type FetchContentFn<C extends CommonContent> = AsyncThunk<Content<C>[], ApiAndIds, ThunkApiConfig>

export const fetchContents = createAsyncThunk<Content[], ApiAndIds, ThunkApiConfig>(
  'contents/fetchMany',
  async ({ api, ids }, { getState }) => {

    const newIds = selectUnknownContentIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their contents are already loaded.
      return []
    }

    const contents = await api.ipfs.getContentArray(newIds as string[])
    return Object.entries(contents).map(([ id, content ]) => {
      const derivedContent = convertToDerivedContent(content) as CommentContent
      return { id, ...derivedContent } 
    })
  }
)

export const fetchProfileContents = fetchContents as FetchContentFn<ProfileContent>
export const fetchSpaceContents = fetchContents as FetchContentFn<SpaceContent>
export const fetchPostContents = fetchContents as FetchContentFn<PostContent>
export const fetchCommentContents = fetchContents as FetchContentFn<CommentContent>
export const fetchSharedPostContents = fetchContents as FetchContentFn<SharedPostContent>

export const fetchContent = createFetchOne(fetchContents)

const contents = createSlice({
  name: 'contents',
  initialState: contentsAdapter.getInitialState(),
  reducers: {
    upsertContent: contentsAdapter.upsertOne
  },
  extraReducers: builder => {
    builder.addCase(fetchContents.fulfilled, contentsAdapter.upsertMany)
    // builder.addCase(fetchContents.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export const {
  upsertContent
} = contents.actions

export default contents.reducer
