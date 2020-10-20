import React, {  } from 'react';
import { getActivities, getActivitiesCount } from '../utils/OffchainUtils';
import { InnerActivities, BaseActivityProps } from './InnerActivities';
import { Tabs } from 'antd';
import { AccountSpaces, LoadSpacesType } from '../spaces/AccountSpaces';
import { AnyAccountId } from '@subsocial/types';
import { NotificationType } from './NotificationUtils';
import { Notification } from './Notification'
import { getLoadMoreNotificationsFn } from './Notifications';

const { TabPane } = Tabs

const loadMoreActivities = getLoadMoreNotificationsFn(getActivities)

type ActivitiesByAddressProps = Partial<LoadSpacesType> & {
  address: AnyAccountId
}

const Activities = ({ address }: BaseActivityProps) => <InnerActivities
  loadMore={loadMoreActivities}
  address={address}
  renderItem={(x: NotificationType, key) => <Notification key={key} {...x} />}
  noDataDesc='No activities yet'
  getCount={getActivitiesCount}
/>

export const AddressActivity = ({ address, spacesData, mySpaceIds }: ActivitiesByAddressProps) => {
  return <Tabs>
    <TabPane tab='All' key='all'>
      <Activities address={address.toString()} />
    </TabPane>
    <TabPane tab='Spaces' key='spaces'>
      <AccountSpaces address={address} spacesData={spacesData} mySpaceIds={mySpaceIds} />
    </TabPane>
  </Tabs>
}


