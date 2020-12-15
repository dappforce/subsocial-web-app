import { AsyncThunkAction } from '@reduxjs/toolkit'
import { getFirstOrUndefined, isEmptyArray, newLogger } from '@subsocial/utils'
import { useState } from 'react'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { FetchManyArgs, FetchOneArgs, SelectManyArgs, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'

type CommonResult = {
  loading?: boolean
  error?: Error
}

export type FetchCommonResult<T> = T & CommonResult

type FetchOneResult<Entity> = FetchCommonResult<{
  entity?: Entity
}>

export type FetchManyResult<Entity> = FetchCommonResult<{
  entities: Entity[]
}>

type SelectFn<Args, Entity> = (state: RootState, args: Args) => Entity

export type SelectManyFn<Args, Entity> = SelectFn<SelectManyArgs<Args>, Entity[]>
export type SelectOneFn<Args, Entity> = (state: RootState, args: SelectOneArgs<Args>) => Entity

type FetchFn<Args, Struct> = (args: Args) =>
  AsyncThunkAction<Struct, Args, ThunkApiConfig>

export type FetchManyFn<Args, Struct> = FetchFn<FetchManyArgs<Args>, Struct[]>
export type FetchOneFn<Args, Struct> = FetchFn<FetchOneArgs<Args>, Struct>

const log = newLogger(useFetchEntities.name)

export function useFetch<Args, Struct> (
  fetch: FetchFn<Args, Struct>,
  args: Args,
): CommonResult {
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState<Error>()
  const dispatch = useAppDispatch()

  useSubsocialEffect(({ subsocial }) => {
    if (loading) return

    // TODO used for debug:
    // console.log('useFetchEntities: useEffect: args:', args)

    let isMounted = true
    setLoading(true)
    setError(undefined)

    dispatch(fetch({ api: subsocial, ...args }))
      .catch((err) => {
        if (isMounted) {
          setError(err)
          log.error(error)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => { isMounted = false }
  }, [ dispatch, args ])

  return {
    loading,
    error,
  }
}

export function useFetchEntities<Args, Struct, Entity> (
  select: SelectManyFn<Args, Entity>,
  fetch: FetchManyFn<Args, Struct>,
  args: SelectManyArgs<Args>
): FetchManyResult<Entity> {
  
  const hasNoIds = isEmptyArray(args.ids)
  const entities = useAppSelector(state => hasNoIds ? [] : select(state, args), shallowEqual)

  // TODO think as dont use "any"
  const { loading, error } = useFetch(fetch as any, args)

  return {
    loading,
    error,
    entities,
  }
}

export function useFetchOneEntity<Args, Struct, Entity> (
  select: SelectOneFn<Args, Entity>,
  fetch: FetchOneFn<Args, Struct>,
  args: SelectOneArgs<Args>
): FetchOneResult<Entity> {
  
  const entity = useAppSelector(state => select(state, args), shallowEqual)
  
  // TODO think as dont use "any"
  const { loading, error } = useFetch(fetch as any, args)

  return {
    loading,
    error,
    entity,
  }
}

export function useFetchEntity<Args, Struct, Entity> (
  select: SelectManyFn<Args, Entity>,
  fetch: FetchManyFn<Args, Struct>,
  args: SelectOneArgs<Args>
): FetchOneResult<Entity> {

  const { id, ..._rest } = args
  const rest = _rest as unknown as Args
  const selectManyArgs = { ids: [ id ], ...rest }
  const { entities, ...props } = useFetchEntities(select, fetch, selectManyArgs)

  return {
    ...props,
    entity: getFirstOrUndefined(entities)
  }
}