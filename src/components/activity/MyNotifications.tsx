import React, {  } from 'react';
import { getNotifications, getNotificationsCount } from '../utils/OffchainUtils';
import NotAuthorized from '../auth/NotAuthorized';
import { HeadMeta } from '../utils/HeadMeta';
import { useMyAddress } from '../auth/MyAccountContext';
import { getLoadMoreFn, InnerActivities } from './InnerActivities';

const NOTIFICATION_TITLE = 'My notifications'

const loadMoreNotifications = getLoadMoreFn(getNotifications)

export const MyNotifications = () => {
  const myAddress = useMyAddress()

  if (!myAddress) return <NotAuthorized />

  return <>
    <HeadMeta title={NOTIFICATION_TITLE} />
    <InnerActivities
      loadMore={loadMoreNotifications}
      address={myAddress} title={NOTIFICATION_TITLE}
      getCount={getNotificationsCount}
    />
  </>
}

export default MyNotifications

