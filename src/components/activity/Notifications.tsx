import React, { useCallback, useEffect, useState } from 'react';
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils';
import { loadNotifications } from './Notification'
import { INFINITE_SCROLL_PAGE_SIZE } from 'src/config/ListData.config';
import { LoadMoreFn, ActivityStore } from './NotificationUtils';

import { InfiniteList } from '../lists/InfiniteList';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, SpaceData, ProfileData } from '@subsocial/types';
import { NotificationType } from './NotificationUtils';
import { Loading } from '../utils';
import { notDef } from '@subsocial/utils';
import { Notification } from './Notification'
import { InnerActivitiesProps, LoadMoreProps, BaseActivityProps } from './types';
type StructId = string

export function NotifActivities ({ loadMore, address, title, getCount, totalCount, noDataDesc, loadingLabel }: InnerActivitiesProps<NotificationType>) {
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ total, setTotalCount ] = useState<number | undefined>(totalCount)

  useEffect(() => {
    if (!address || !getCount) return

    getCount
      ? getCount(address).then(setTotalCount)
      : setTotalCount(0)
  }, [])

  const activityStore: ActivityStore = {
    spaceById: new Map<StructId, SpaceData>(),
    postById: new Map<StructId, PostData>(),
    ownerById: new Map<StructId, ProfileData>()
  }
  const noData = notDef(total)

  const Activities = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={title ? `${title} (${total})` : null}
    noDataDesc={noDataDesc}
    totalCount={total || 0}
    renderItem={(x: NotificationType, key) => <Notification key={key} {...x} />}
    loadMore={(page, size) => loadMore({ subsocial, address, page, size, activityStore })}
  />, [ address, isApiReady, noData ])

  if (!isApiReady || noData) return <Loading label={loadingLabel} />

  return <Activities />
}

export type NotifActivitiesType = 'notifications' | 'activities'

export const getLoadMoreNotificationsFn = (getActivity: LoadMoreFn, type: NotifActivitiesType) =>
  async (props: LoadMoreProps) => {
    const { subsocial, address, page, size, activityStore = {} as ActivityStore } = props

    if (!address) return []

    const offset = (page - 1) * size

    const items = await getActivity(address, offset, INFINITE_SCROLL_PAGE_SIZE) || []

    return loadNotifications(subsocial, items, activityStore, type)
  }

const loadMoreNotifications = getLoadMoreNotificationsFn(getNotifications, 'notifications')
const loadingLabel = 'Loading your notifications...'

export const Notifications = ({ address, title }: BaseActivityProps) => <NotifActivities
  loadMore={loadMoreNotifications}
  address={address}
  title={title}
  loadingLabel={loadingLabel}
  noDataDesc='No notifications for you'
  getCount={getNotificationsCount}
/>

