import React, { useCallback } from 'react';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { getNotifications } from '../utils/OffchainUtils';
import NotAuthorized from '../auth/NotAuthorized';
import { HeadMeta } from '../utils/HeadMeta';
import { useMyAddress } from '../auth/MyAccountContext';
import { Notification, loadNotifications } from './Notification';
import { InfiniteList } from '../lists/InfiniteList';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, SpaceData, ProfileData } from '@subsocial/types';
import { ActivityStore, NotificationType } from './NotificationUtils';
import { Loading } from '../utils';


export const InnerMyNotifications = () => {
  const myAddress = useMyAddress()
  const { subsocial, isApiReady } = useSubsocialApi()

  const activityStore: ActivityStore = {
    spaceById: new Map<string, SpaceData>(),
    postById: new Map<string, PostData>(),
    ownerById: new Map<string, ProfileData>()
  }

  const Notifications = useCallback(() => <InfiniteList
    dataSource={[] as NotificationType[]}
    title={'My notifications'}
    noDataDesc='No notifications for you'
    loadMore={async (page: number, size: number) => {
        const offset = (page - 1) * size
        const items = await getNotifications(myAddress as string, offset, INFINITE_SCROLL_PAGE_SIZE);

        return loadNotifications(subsocial, items, activityStore)

      }
    }
    renderItem={(x, key) => <Notification key={key} {...x}/>}
    initialLoad
  />, [ myAddress, isApiReady ])

  if (!isApiReady) return <Loading label='Loading your notifications...' />

  if (!myAddress) return <NotAuthorized />;

  return <Notifications />
}

export const MyNotifications = () => {
  return <>
    <HeadMeta title='My Notifications' />
    <InnerMyNotifications />
  </>
}

export default MyNotifications
