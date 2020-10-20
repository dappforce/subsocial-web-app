import React, {  } from 'react';
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils';
import { BaseActivityProps, LoadMoreProps, NotifActivities } from './InnerActivities';
import { loadNotifications } from './Notification'
import { Activity } from '@subsocial/types';
import { INFINITE_SCROLL_PAGE_SIZE } from 'src/config/ListData.config';

type LoadMoreFn = (
  myAddress: string,
  offset: number,
  limit: number
) => Promise<Activity[]>

export const getLoadMoreNotificationsFn = (getActivity: LoadMoreFn) =>
  async (props: LoadMoreProps) => {
    const { subsocial, address, page, size, activityStore } = props

    if (!address) return []

    const offset = (page - 1) * size

    const items = await getActivity(address, offset, INFINITE_SCROLL_PAGE_SIZE)

    console.log('items', items)

    return loadNotifications(subsocial, items, activityStore)
  }

const loadMoreNotifications = getLoadMoreNotificationsFn(getNotifications)
const loadingLabel = 'Loading your notifications...'

export const Notifications = ({ address, title }: BaseActivityProps) => <NotifActivities
  loadMore={loadMoreNotifications}
  address={address}
  title={title}
  loadingLabel={loadingLabel}
  noDataDesc='No notifications for you'
  getCount={getNotificationsCount}
/>

