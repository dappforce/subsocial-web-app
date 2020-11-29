import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { ApiAndIds, createFetchOne, createFilterNewIds, idsToBns, selectManyByIds, ThunkApiConfig } from 'src/rtk/app/helpers'
import { getUniqueContentIds, getUniqueOwnerIds, SpaceStruct, flattenSpaceStructs } from 'src/rtk/app/flatteners'
import { RootState } from 'src/rtk/app/rootReducer'
import { fetchContents, selectSpaceContentById } from '../contents/contentsSlice'
import { fetchProfiles, selectProfiles } from '../profiles/profilesSlice'
import { ProfileData, SpaceWithSomeDetails } from 'src/rtk/app/dto'

const spacesAdapter = createEntityAdapter<SpaceStruct>()

const spacesSelectors = spacesAdapter.getSelectors<RootState>(state => state.spaces)

// Rename the exports for readability in component usage
export const {
  selectById: selectSpaceStructById,
  selectIds: selectSpaceIds,
  selectEntities: selectSpaceEntities,
  selectAll: selectAllSpaces,
  selectTotal: selectTotalSpaces
} = spacesSelectors

// const _selectSpace = (state: RootState, id: EntityId): SpaceData | undefined =>
//   selectOneById(state, id, selectSpaceStructById, selectSpaceContentById)

const _selectSpacesByIds = (state: RootState, ids: EntityId[]) =>
  selectManyByIds(state, ids, selectSpaceStructById, selectSpaceContentById)

type SelectArgs = {
  ids: EntityId[]
  withOwner?: boolean
}

export function selectSpaces (state: RootState, props: SelectArgs): SpaceWithSomeDetails[] {
  const { ids, withOwner = true } = props
  const spaces = _selectSpacesByIds(state, ids)

  // TODO Fix copypasta. Places: selectSpaces & selectPosts
  const ownerByIdMap = new Map<EntityId, ProfileData>()
  if (withOwner) {
    const ownerIds = getUniqueOwnerIds(spaces)
    const profiles = selectProfiles(state, ownerIds)
    profiles.forEach(profile => {
      ownerByIdMap.set(profile.id, profile)
    })
  }
  
  const result: SpaceWithSomeDetails[] = []
  spaces.forEach(space => {
    const { ownerId } = space.struct

    // TODO Fix copypasta. Places: selectSpaces & selectPosts
    let owner: ProfileData | undefined
    if (ownerId) {
      owner = ownerByIdMap.get(ownerId)
    }

    result.push({ ...space, owner })
  })
  return result
}

const filterNewIds = createFilterNewIds(selectSpaceIds)

type FetchArgs = ApiAndIds & {
  withContent?: boolean
  withOwner?: boolean
}

export const fetchSpaces = createAsyncThunk<SpaceStruct[], FetchArgs, ThunkApiConfig>(
  'spaces/fetchMany',
  async ({ api, ids, withContent = true, withOwner = true }, { getState, dispatch }) => {

    const newIds = filterNewIds(getState(), ids)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their spaces are already loaded.
      return []
    }

    const structs = await api.substrate.findSpaces({ ids: idsToBns(newIds) })
    const entities = flattenSpaceStructs(structs)
    const fetches: Promise<any>[] = []
    
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
