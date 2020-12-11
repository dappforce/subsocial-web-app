import React from 'react'
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils'
import { DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { LoadMoreFn, ActivityStore, loadNotifications } from './NotificationUtils'
import { PostData, SpaceData, ProfileData } from 'src/types'
import { NotificationType } from './NotificationUtils'
import { Notification } from './Notification'
import { LoadMoreProps, BaseActivityProps, ActivityProps } from './types'
import { InnerActivities } from './InnerActivities'
import { readAllNotifications } from 'src/session_keys/createSessionKey'
type StructId = string

export const NotifActivities = ({ loadMore ,...props }: ActivityProps<NotificationType>) => {
  const activityStore: ActivityStore = {
    spaceById: new Map<StructId, SpaceData>(),
    postById: new Map<StructId, PostData>(),
    ownerById: new Map<StructId, ProfileData>()
  }

  return <InnerActivities
    {...props}
    getKey={x => x.id}
    renderItem={(x: NotificationType) => <Notification {...x} />}
    loadMore={(props) => loadMore({ ...props, activityStore })}
  />
}

export type NotifActivitiesType = 'notifications' | 'activities'

export const getLoadMoreNotificationsFn = (getActivity: LoadMoreFn, type: NotifActivitiesType) =>
  async (props: LoadMoreProps) => {
    const { flatApi, address, page, size, activityStore = {} as ActivityStore } = props

    if (!address) return []

    const offset = (page - 1) * size

    const activities = await getActivity(address, offset, DEFAULT_PAGE_SIZE) || []
    const lastActivity = activities.pop()
    if (lastActivity && !offset) {
      const { block_number, event_index } = lastActivity
      await readAllNotifications(block_number, event_index, address)
    }
    return loadNotifications({ flatApi, activities, activityStore, type, myAddress: address })
  }

const loadMoreNotifications = getLoadMoreNotificationsFn(getNotifications, 'notifications')

export const Notifications = ({ address, title }: BaseActivityProps) => <NotifActivities
  loadMore={loadMoreNotifications}
  address={address}
  title={title}
  loadingLabel='Loading your notifications...'
  noDataDesc='No notifications for you'
  getCount={getNotificationsCount}
/>

