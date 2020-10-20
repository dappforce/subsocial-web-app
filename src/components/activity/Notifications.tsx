import React, { useCallback, useEffect, useState } from 'react';
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils';
import { loadNotifications } from './Notification'
import { INFINITE_SCROLL_PAGE_SIZE } from 'src/config/ListData.config';
import { LoadMoreFn, ActivityStore, EventsMsg } from './NotificationUtils';

import { InfiniteList } from '../lists/InfiniteList';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, SpaceData, ProfileData } from '@subsocial/types';
import { NotificationType } from './NotificationUtils';
import { Loading } from '../utils';
import { notDef } from '@subsocial/utils';
import { Notification } from './Notification'
import { InnerActivitiesProps, LoadMoreProps, BaseActivityProps } from './types';
import msg from '../../messages'
type StructId = string

export function NotifActivities ({ loadMore, address, title, getCount, noDataDesc, loadingLabel }: InnerActivitiesProps<NotificationType>) {
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ totalCount, setTotalCount ] = useState<number>()

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

  const Activities = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={title ? `${title} (${totalCount})` : null}
    noDataDesc={noDataDesc}
    totalCount={totalCount || 0}
    renderItem={(x: NotificationType, key) => <Notification key={key} {...x} />}
    loadMore={(page, size) => loadMore({ subsocial, address, page, size, activityStore })}
  />, [ address, isApiReady, totalCount ])

  if (!isApiReady || notDef(totalCount)) return <Loading label={loadingLabel} />

  return <Activities />
}

export const getLoadMoreNotificationsFn = (getActivity: LoadMoreFn, eventMsg: EventsMsg) =>
  async (props: LoadMoreProps) => {
    const { subsocial, address, page, size, activityStore = {} as ActivityStore } = props

    if (!address) return []

    const offset = (page - 1) * size

    const items = await getActivity(address, offset, INFINITE_SCROLL_PAGE_SIZE)

    return loadNotifications(subsocial, items, activityStore, eventMsg)
  }

const loadMoreNotifications = getLoadMoreNotificationsFn(getNotifications, msg.notifications)
const loadingLabel = 'Loading your notifications...'

export const Notifications = ({ address, title }: BaseActivityProps) => <NotifActivities
  loadMore={loadMoreNotifications}
  address={address}
  title={title}
  loadingLabel={loadingLabel}
  noDataDesc='No notifications for you'
  getCount={getNotificationsCount}
/>

