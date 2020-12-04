import { AsyncThunkAction } from '@reduxjs/toolkit'
import { getFirstOrUndefined, newLogger } from '@subsocial/utils'
import { useState } from 'react'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { FetchManyArgs, SelectManyArgs, SelectOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'

type FetchCommonResult<T> = T & {
  loading?: boolean
  error?: Error
}

type FetchOneResult<Entity> = FetchCommonResult<{
  entity?: Entity
}>

type FetchManyResult<Entity> = FetchCommonResult<{
  entities: Entity[]
}>

type SelectFn<Args, Entity> = (state: RootState, args: SelectManyArgs<Args>) => Entity[]

type FetchFn<Args, Struct> = (args: FetchManyArgs<Args>) =>
  AsyncThunkAction<Struct[], FetchManyArgs<Args>, ThunkApiConfig>

const log = newLogger(useFetchEntities.name)

export function useFetchEntities<Args, Struct, Entity> (
  select: SelectFn<Args, Entity>,
  fetch: FetchFn<Args, Struct>,
  args: SelectManyArgs<Args>
): FetchManyResult<Entity> {
  
  const entities = useAppSelector(state => select(state, args), shallowEqual)

  // TODO try useMemo for better performance?
  // const entities = useMemo(() => useAppSelector(state => select(state, args), shallowEqual, [ args ])

  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState<Error | undefined>()
  const dispatch = useAppDispatch()

  useSubsocialEffect(({ subsocial }) => {
    console.log('In use Effect')
    if (loading) return

    setLoading(true)
    setError(undefined)

    dispatch(fetch({ api: subsocial, ...args }))
      .catch((err) => {
        setError(err)
        log.error(error)
      })
      .finally(() => {
        setLoading(false)
      })  
  }, [ dispatch, args ])

  return {
    loading,
    error,
    entities,
  }
}

export function useFetchEntity<Args, Struct, Entity> (
  select: SelectFn<Args, Entity>,
  fetch: FetchFn<Args, Struct>,
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