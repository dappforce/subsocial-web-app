import React, { useCallback, useEffect, useState } from 'react';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { Notification, loadNotifications } from './Notification';
import { InfiniteList } from '../lists/InfiniteList';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, SpaceData, ProfileData, Activity } from '@subsocial/types';
import { ActivityStore, NotificationType } from './NotificationUtils';
import { Loading } from '../utils';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { ParsedPaginationQuery } from '../utils/getIds';
import { notDef } from '@subsocial/utils';

const loadingLabel = 'Loading your notifications...'

type StructId = string

type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  address?: string
  activityStore: ActivityStore
}

type LoadMoreFn = (
  myAddress: string,
  offset: number,
  limit: number
) => Promise<Activity[]>

type GetCountFn = (account: string) => Promise<number>

export const getLoadMoreFn = (getActivity: LoadMoreFn) =>
  async (props: LoadMoreProps) => {
    const { subsocial, address, page, size, activityStore } = props

    if (!address) return []

    const offset = (page - 1) * size

    const items = await getActivity(address, offset, INFINITE_SCROLL_PAGE_SIZE)

    console.log('items', items)

    return loadNotifications(subsocial, items, activityStore)
  }


type InnerActivitiesProps = {
  loadMore: (props: LoadMoreProps) => Promise<NotificationType[]>
  getCount: GetCountFn,
  address: string,
  title?: string
}

export const InnerActivities = ({ loadMore, address, title, getCount }: InnerActivitiesProps) => {
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ totalCount, setTotalCount ] = useState<number>()

  console.log('totalCount', totalCount)

  useEffect(() => {
    if (!address) return

    getCount(address)
      .then(setTotalCount)
  })

  const activityStore: ActivityStore = {
    spaceById: new Map<StructId, SpaceData>(),
    postById: new Map<StructId, PostData>(),
    ownerById: new Map<StructId, ProfileData>()
  }

  const Notifications = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={title ? `${title} (${totalCount})` : null}
    noDataDesc='No notifications for you'
    totalCount={totalCount || 0}
    renderItem={(x: NotificationType, key) => <Notification key={key} {...x} />}
    loadMore={(page, size) => loadMore({ subsocial, address, page, size, activityStore })}
  />, [ address, isApiReady, totalCount ])

  if (!isApiReady || notDef(totalCount)) return <Loading label={loadingLabel} />


  return <Notifications />
}



