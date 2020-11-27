import { AsyncThunk, EntityId } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { CommonContent } from '@subsocial/types'
import { getFirstOrUndefined, isEmptyArray, nonEmptyStr } from '@subsocial/utils'
import BN from 'bn.js'
import { HasId, NormalizedSuperCommon } from './normalizers'
import { RootState } from './rootReducer'
import { AppDispatch, AppThunk } from './store'

export type ThunkApiConfig = {
  state: RootState
  dispatch: AppDispatch
}

type StructEntity = HasId & NormalizedSuperCommon

type ContentEntity = HasId & CommonContent

type AnyId = string | number | BN

type ApiAndId = {
  api: SubsocialApi
  id: AnyId
}

export type ApiAndIds = {
  api: SubsocialApi
  ids: AnyId[]
}

export function createFilterNewIds (selectIds: (state: RootState) => EntityId[]) {
  return (state: RootState, ids: AnyId[]) => {
    if (isEmptyArray(ids)) return []

    const knownIds = new Set(selectIds(state))
    return ids.filter(id => !knownIds.has(id.toString()))
  }
}

export function idsToBns (ids: AnyId[]): BN[] {
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
): (S & C)[] {

  const result: (S & C)[] = []

  ids.forEach((id) => {
    const struct = selectStructById(state, id)
    if (struct && nonEmptyStr(struct.contentId)) {
      const { contentId } = struct
      const content = selectContentById(state, contentId)
      if (content) {
        result.push({
          ...struct,
          ...content,

          // We need to set the id field explicitly
          // because content also has id that is IPFS CID.
          id: struct.id
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
): (S & C) | undefined {
  const items = selectManyByIds(state, [ id ], selectStructById, selectContentById)
  return getFirstOrUndefined(items)
}
