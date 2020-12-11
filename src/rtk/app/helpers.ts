import { useSubsocialApi } from 'src/components/utils/SubsocialApiContext'
import { AsyncThunk, Dispatch, EntityId } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { getFirstOrUndefined, isEmptyArray, nonEmptyStr } from '@subsocial/utils'
import { useDispatch } from 'react-redux'
import { CommonContent, EntityData, FlatSuperCommon, HasId } from 'src/types'
import { asString } from 'src/utils'
import { RootState } from './rootReducer'
import { AppDispatch, AppThunk } from './store'

export type ThunkApiConfig = {
  state: RootState
  dispatch: AppDispatch
}

type StructEntity = HasId & Partial<FlatSuperCommon>

type ContentEntity = HasId & CommonContent

export type CommonVisibility = 'onlyPublic' | 'onlyUnlisted'
export type HasHiddenVisibility = CommonVisibility | 'onlyVisible' | 'onlyHidden'

export type ApiArg = {
  api: SubsocialApi
}

type ApiAndId = ApiArg & {
  id: EntityId
}

export type ApiAndIds = ApiArg & {
  ids: EntityId[]
}

export type SelectOneArgs <T> = T & {
  id: EntityId
}

export type SelectManyArgs <T> = T & {
  ids: EntityId[]
}

export type FetchOneArgs <T> = T & ApiAndId

export type FetchManyArgs <T> = T & ApiAndIds

export function createSelectUnknownIds (selectIds: (state: RootState) => EntityId[]) {
  return (state: RootState, ids: EntityId[]): string[] => {
    if (isEmptyArray(ids)) return []

    const knownStrIds = selectIds(state).map(asString)
    const knownIds = new Set(knownStrIds)
    const newIds: string[] = []

    ids.forEach(id => {
      const strId = asString(id)
      if (!knownIds.has(strId)) {
        knownIds.add(strId)
        newIds.push(strId)
      }
    })

    return newIds
  }
}

function toApiAndIds ({ api, id }: ApiAndId): ApiAndIds {
  return { api, ids: [ id ] }
}

type FetchManyFn<Returned> = AsyncThunk<Returned[], ApiAndIds, {}>

export function createFetchOne<R> (fetchMany: FetchManyFn<R>) {
  return (arg: ApiAndId): AppThunk => async dispatch => {
    await dispatch(fetchMany(toApiAndIds(arg)))
  }
}

// export function createFetchMany<
//   S extends StructEntity,
//   C extends ContentEntity
// > (
//   fetchManyStructs: FetchManyFn<S>,
//   fetchManyContents: FetchManyFn<C>,
// ) {
//   return (arg: ApiAndIds): AppThunk => async dispatch => {
//     await dispatch(fetchManyStructs(arg))
//     await dispatch(fetchManyContents(arg))
//   }
// }

export type SelectByIdFn<R> = (state: RootState, id: EntityId) => R | undefined

export function selectManyByIds<
  S extends StructEntity,
  C extends ContentEntity
> (
  state: RootState,
  ids: EntityId[],
  selectStructById: SelectByIdFn<S>,
  selectContentById: SelectByIdFn<C>
): EntityData<S, C>[] {

  const result: EntityData<S, C>[] = []

  ids.forEach((id) => {
    const struct = selectStructById(state, id)
    if (struct) {
      const item: EntityData<S, C> = {
        id: struct.id,
        struct,
      }

      if (nonEmptyStr(struct.contentId)) {
        const { contentId } = struct
        const content = selectContentById(state, contentId)
        item.content = content
      }

      result.push(item)

    }
  })

  return result
}

export function selectOneById<
  S extends StructEntity,
  C extends ContentEntity
> (
  state: RootState,
  id: EntityId,
  selectStructById: SelectByIdFn<S>,
  selectContentById: SelectByIdFn<C>
): EntityData<S, C> | undefined {
  const items = selectManyByIds(state, [ id ], selectStructById, selectContentById)
  return getFirstOrUndefined(items)
}

type CommonDispatchCallbackProps<T> = { dispatch: Dispatch<any>, api: SubsocialApi, args: T }

type CommonDispatchCallbackFn<T> = (props: CommonDispatchCallbackProps<T>) => void 
// ? Change cb on actions[]. And use actions.forEach(action => dispatch(action))
export const useActions = <T>(cb: CommonDispatchCallbackFn<T>) => {
  const dispatch = useDispatch()
  const { subsocial: api } = useSubsocialApi()

  return (args: T) => cb({ dispatch, api, args })
}
