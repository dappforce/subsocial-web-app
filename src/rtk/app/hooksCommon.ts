import { AsyncThunkAction, EntityId } from '@reduxjs/toolkit'
import { useState } from 'react'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { FetchManyArgs, SelectManyArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'

type FetchResult<Entity> = {
  loading?: boolean
  error?: Error
  entities: Entity[]
}

type SelectFn<Args, Entity> = (state: RootState, args: SelectManyArgs<Args>) => Entity[]

type FetchFn<Args, Struct> = (args: FetchManyArgs<Args>) =>
  AsyncThunkAction<Struct[], FetchManyArgs<Args>, ThunkApiConfig>

export type FetchEntitiesFn <R> = (ids: EntityId) => R

export function useFetchEntities<Args, Struct, Entity> (
  select: SelectFn<Args, Entity>,
  fetch: FetchFn<Args, Struct>,
  args: SelectManyArgs<Args>
): FetchResult<Entity> {
  
  const entities = useAppSelector(state => select(state, args), shallowEqual)

  // TODO try useMemo for better performance?
  // const entities = useMemo(() => useAppSelector(state => select(state, args), shallowEqual, [ args ])

  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState<Error | undefined>()
  const dispatch = useAppDispatch()

  useSubsocialEffect(({ subsocial }) => {
    if (loading) return

    setLoading(true)
    setError(undefined)

    dispatch(fetch({ api: subsocial, ...args }))
      .then(() => {
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        setError(err)
      })
  }, [ dispatch, args ])

  return {
    loading,
    error,
    entities,
  }
}
