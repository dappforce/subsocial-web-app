import React, { useCallback, useEffect, useState } from 'react';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils';
import NotAuthorized from '../auth/NotAuthorized';
import { HeadMeta } from '../utils/HeadMeta';
import { useMyAddress } from '../auth/MyAccountContext';
import { Notification, loadNotifications } from './Notification';
import { InfiniteList } from '../lists/InfiniteList';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, SpaceData, ProfileData } from '@subsocial/types';
import { ActivityStore, NotificationType } from './NotificationUtils';
import { Loading } from '../utils';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { ParsedPaginationQuery } from '../utils/getIds';

const NOTIFICATION_TITLE = 'My notifications'
const loadingLabel = 'Loading your notifications...'

type StructId = string

type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  myAddress?: string
  activityStore: ActivityStore
}

const loadMore = async (props: LoadMoreProps) => {
  const { subsocial, myAddress, page, size, activityStore } = props

  if (!myAddress) return []

  const offset = (page - 1) * size

  const items = await getNotifications(myAddress, offset, INFINITE_SCROLL_PAGE_SIZE)

  return loadNotifications(subsocial, items, activityStore)
}

export const InnerMyNotifications = () => {
  const myAddress = useMyAddress()
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ totalCount, setTotalCount ] = useState<number>()

  useEffect(() => {
    if (!myAddress) return

    getNotificationsCount(myAddress)
      .then(setTotalCount)
  })

  const activityStore: ActivityStore = {
    spaceById: new Map<StructId, SpaceData>(),
    postById: new Map<StructId, PostData>(),
    ownerById: new Map<StructId, ProfileData>()
  }

  const Notifications = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={`${NOTIFICATION_TITLE} (${totalCount})`}
    noDataDesc='No notifications for you'
    totalCount={totalCount || 0}
    renderItem={(x: NotificationType, key) => <Notification key={key} {...x} />}
    loadMore={(page, size) => loadMore({ subsocial, myAddress, page, size, activityStore })}
  />, [ myAddress, isApiReady, totalCount ])

  if (!isApiReady || !totalCount) return <Loading label={loadingLabel} />

  if (!myAddress) return <NotAuthorized />

  return <Notifications />
}

export const MyNotifications = () => {
  return <>
    <HeadMeta title={NOTIFICATION_TITLE} />
    <InnerMyNotifications />
  </>
}

export default MyNotifications
