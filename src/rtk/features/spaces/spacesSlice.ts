import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { SpaceContent } from '@subsocial/types'
import { nonEmptyArr } from '@subsocial/utils'
import { ApiAndIds, createFetchOne, createFilterNewIds, idsToBns, selectOneById, selectManyByIds, ThunkApiConfig, createFetchMany } from 'src/rtk/app/helpers'
import { getContentIds, NormalizedSpace, normalizeSpaceStructs } from 'src/rtk/app/normalizers'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchContents, selectSpaceContentById } from '../contents/contentsSlice'

export type FullSpace = NormalizedSpace & SpaceContent

const spacesAdapter = createEntityAdapter<NormalizedSpace>()

const spacesSelectors = spacesAdapter.getSelectors<RootState>(state => state.spaces)

// Rename the exports for readability in component usage
export const {
  selectById: selectSpaceStructById,
  selectIds: selectSpaceIds,
  selectEntities: selectSpaceEntities,
  selectAll: selectAllSpaces,
  selectTotal: selectTotalSpaces
} = spacesSelectors

export const selectSpaceById = (state: RootState, id: EntityId): FullSpace | undefined =>
  selectOneById(state, id, selectSpaceStructById, selectSpaceContentById)

export const selectSpacesByIds = (state: RootState, ids: EntityId[]): FullSpace[] =>
  selectManyByIds(state, ids, selectSpaceStructById, selectSpaceContentById)

const filterNewIds = createFilterNewIds(selectSpaceIds)

export const fetchSpaces = createAsyncThunk<NormalizedSpace[], ApiAndIds, ThunkApiConfig>(
  'spaces/fetchMany',
  async ({ api, ids }, { getState, dispatch }) => {

    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their spaces are already loaded.
      return []
    }

    const structs = await api.substrate.findSpaces({ ids: idsToBns(newIds) })
    const entities = normalizeSpaceStructs(structs)

    const cids = getContentIds(entities)
    if (nonEmptyArr(cids)) {
      await dispatch(fetchContents({ api, ids: cids }))
    }

    return entities
  }
)

export const fetchSpace = createFetchOne(fetchSpaces)

const spaces = createSlice({
  name: 'spaces',
  initialState: spacesAdapter.getInitialState(),
  reducers: {
    updateSpace: spacesAdapter.updateOne
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaces.fulfilled, spacesAdapter.upsertMany)
    // builder.addCase(fetchSpaces.rejected, (state, action) => {
    //   state.error = action.error
    // })
  }
})

export default spaces.reducer
