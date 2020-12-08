import { InnerActivitiesProps } from './types'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { useState, useEffect, useCallback } from 'react'
import { notDef } from '@subsocial/utils'
import { InfiniteListByPage } from '../lists/InfiniteList'
import { Loading } from '../utils'
import { useDispatch } from 'react-redux'

export function InnerActivities<T> (props: InnerActivitiesProps<T>) {
  const { address, title, getCount, totalCount, noDataDesc, loadingLabel, loadMore, ...otherProps } = props
  const { subsocial, flatApi, isApiReady } = useSubsocialApi()
  const dispatch = useDispatch()

  const [ total, setTotalCount ] = useState<number | undefined>(totalCount)

  useEffect(() => {
    if (!address || !getCount) return

    getCount
      ? getCount(address).then(setTotalCount)
      : setTotalCount(0)
  }, [ address ])

  const noData = notDef(total)

  const Activities = useCallback(() => <InfiniteListByPage
    {...otherProps}
    loadMore={(page, size) => loadMore({ subsocial, flatApi, dispatch, address, page, size })}
    loadingLabel={loadingLabel}
    title={title ? `${title} (${total})` : null}
    noDataDesc={noDataDesc}
    totalCount={total || 0}

  />, [ isApiReady, noData, total ])

  if (!isApiReady || noData) return <Loading label={loadingLabel} />

  return <Activities />
}
