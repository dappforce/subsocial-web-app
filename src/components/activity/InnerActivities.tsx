import { InnerActivitiesProps } from './types'
import { useSubsocialApi } from '../utils/SubsocialApiContext'
import { useState, useEffect, useCallback } from 'react'
import { notDef } from '@subsocial/utils'
import { InfiniteListByPage } from '../lists/InfiniteList'
import { Loading } from '../utils'

export function InnerActivities<T> ({ address, title, getCount, totalCount, noDataDesc, loadingLabel, loadMore, ...otherProps }: InnerActivitiesProps<T>) {
  const { flatApi, subsocial, isApiReady } = useSubsocialApi()
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
    loadMore={(page, size) => loadMore({ flatApi, subsocial, address, page, size})}
    loadingLabel={loadingLabel}
    title={title ? `${title} (${total})` : null}
    noDataDesc={noDataDesc}
    totalCount={total || 0}

  />, [ isApiReady, noData, total ])

  if (!isApiReady || noData) return <Loading label={loadingLabel} />

  return <Activities />
}
