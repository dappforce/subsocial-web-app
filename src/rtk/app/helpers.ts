import { AsyncThunk, EntityId } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { CommonContent } from '@subsocial/types'
import { getFirstOrUndefined, isEmptyArray, nonEmptyStr } from '@subsocial/utils'
import BN from 'bn.js'
import { asString } from 'src/utils'
import { EntityData } from './dto'
import { FlatSuperCommon, HasId } from './flatteners'
import { RootState } from './rootReducer'
import { AppDispatch, AppThunk } from './store'

export type ThunkApiConfig = {
  state: RootState
  dispatch: AppDispatch
}

type StructEntity = HasId & Partial<FlatSuperCommon>

type ContentEntity = HasId & CommonContent

type ApiAndId = {
  api: SubsocialApi
  id: EntityId
}

export type ApiAndIds = {
  api: SubsocialApi
  ids: EntityId[]
}

export type SelectManyArgs <T> = T & {
  ids: EntityId[]
}

export type FetchManyArgs <T> = T & ApiAndIds

export function createFilterNewIds (selectIds: (state: RootState) => EntityId[])
{
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

export function idsToBns (ids: EntityId[]): BN[] {
  return ids.map(id => BN.isBN(id) ? id : new BN(id))
}

function toApiAndIds ({ api, id }: ApiAndId): ApiAndIds {
  return { api, ids: [ id ] }
}

type FetchManyFn<Returned> = AsyncThunk<Returned[], ApiAndIds, {}>

export function createFetchOne<R> (fetchMany: FetchManyFn<R>) {
  return (arg: ApiAndId): AppThunk => async dispatch => {
    dispatch(fetchMany(toApiAndIds(arg)))
  }
}

export function createFetchMany<
  S extends StructEntity,
  C extends ContentEntity
> (
  fetchManyStructs: FetchManyFn<S>,
  fetchManyContents: FetchManyFn<C>,
) {
  return (arg: ApiAndIds): AppThunk => async dispatch => {
    dispatch(fetchManyStructs(arg))
    dispatch(fetchManyContents(arg))
  }
}

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
    if (struct && nonEmptyStr(struct.contentId)) {
      const { contentId } = struct
      const content = selectContentById(state, contentId)
      if (content) {
        result.push({
          id: struct.id,
          struct,
          content,
        })
      }
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
