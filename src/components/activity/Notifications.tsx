import React from 'react'
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils'
import { DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { AccountId, SpaceId, PostId } from 'src/types'
import { Notification } from './Notification'
import { LoadMoreProps, BaseActivityProps, ActivityProps, LoadMoreFn } from './types'
import { InnerActivities } from './InnerActivities'
import { readAllNotifications } from 'src/session_keys/createSessionKey'
import { nonEmptyStr } from '@subsocial/utils'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { fetchProfiles } from 'src/rtk/features/profiles/profilesSlice'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { Activity } from '@subsocial/types'

export type NotifActivitiesType = 'notifications' | 'activities'

type NotifActivitiesProps = ActivityProps<Activity> & {
  type: NotifActivitiesType
}

export const NotifActivities = ({ loadMore, type, ...props }: NotifActivitiesProps) => {
  return <InnerActivities
    {...props}
    getKey={({ block_number, event_index }) => `${block_number}-${event_index}`}
    renderItem={(activity) => <Notification activity={activity} type={type} />}
    loadMore={loadMore}
  />
}


export const getLoadMoreActivitiesFn = (getActivity: LoadMoreFn) =>
  async (props: LoadMoreProps) => {
    const { address, page, size, subsocial: api, dispatch } = props

    if (!address) return []

    const offset = (page - 1) * size

    const activities = await getActivity(address, offset, DEFAULT_PAGE_SIZE) || []


    const ownerIds: AccountId[] = []
    const spaceIds: SpaceId[] = []
    const postIds: PostId[] = []

    activities.forEach(({ account, following_id, space_id, post_id, comment_id }) => {
      nonEmptyStr(account) && ownerIds.push(account)
      nonEmptyStr(following_id) && ownerIds.push(following_id)
      nonEmptyStr(space_id) && spaceIds.push(space_id)
      nonEmptyStr(post_id) && postIds.push(post_id)
      nonEmptyStr(comment_id) && postIds.push(comment_id)
    })

    const fetches: Promise<any>[] = [
      dispatch(fetchSpaces({ ids: spaceIds, api })),
      dispatch(fetchProfiles({ ids: ownerIds, api })),
      dispatch(fetchPosts({ ids: postIds, api })),
    ]

    await Promise.all(fetches)

    return activities
  }

type NotificationsFn = (props: LoadMoreProps) => Promise<Activity[]>

const getLoadMoreNotifications = (getNotifs: NotificationsFn) =>
  async (props: LoadMoreProps) => {
    const { address, page, size } = props

    if (!address) return []
    const offset = (page - 1) * size

    const notifications = await getNotifs(props)

    const lastActivity = notifications[notifications.length - 1]
    if (lastActivity && !offset) {
      const { block_number, event_index } = lastActivity
      await readAllNotifications(block_number, event_index, address)
    }

    return notifications
  }

const loadMoreActivities = getLoadMoreActivitiesFn(getNotifications)

const loadMoreNotifications = getLoadMoreNotifications(loadMoreActivities)

export const Notifications = ({ address, title }: BaseActivityProps) => <NotifActivities
  type='notifications'
  loadMore={loadMoreNotifications}
  address={address}
  title={title}
  loadingLabel='Loading your notifications...'
  noDataDesc='No notifications for you'
  getCount={getNotificationsCount}
/>

