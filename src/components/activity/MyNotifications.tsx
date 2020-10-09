import React, { useCallback } from 'react';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { getNotifications } from '../utils/OffchainUtils';
import NotAuthorized from '../auth/NotAuthorized';
import { HeadMeta } from '../utils/HeadMeta';
import { useMyAddress } from '../auth/MyAccountContext';
import { Notification, loadNotifications } from './Notification';
import { InfiniteList } from '../lists/InfiniteList';
import { PageContent } from '../main/PageWrapper';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, SpaceData, ProfileData } from '@subsocial/types';
import { ActivityStore } from './NotificationUtils';

export const MyNotifications = () => {
  const myAddress = useMyAddress()
  const { subsocial, isApiReady } = useSubsocialApi()

  const activityStore: ActivityStore = {
    spaceById: new Map<string, SpaceData>(),
    postById: new Map<string, PostData>(),
    ownerById: new Map<string, ProfileData>()
  }

  const getNextPage = useCallback(async (page: number, size: number) => {
    if (!myAddress || !isApiReady) return undefined

    const offset = (page - 1) * size

    const items = await getNotifications(myAddress, offset, INFINITE_SCROLL_PAGE_SIZE);

    return loadNotifications(subsocial, items, activityStore)

  }, [ myAddress, isApiReady ]);

  if (!myAddress) return <NotAuthorized />;

  return <>
    <HeadMeta title='My Notifications' />
    <PageContent >
      <InfiniteList
        title={'My notificatiost'}
        noDataDesc='No notifications for you'
        loadMore={getNextPage}
        renderItem={(x, key) => <Notification key={key} {...x}/>}
        resetTriggers={[ isApiReady ]}
        initialLoad
      />
    </PageContent>
  </>
}

export default MyNotifications
