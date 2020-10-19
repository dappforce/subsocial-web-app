import React, {  } from 'react';
import { getActivities, getActivitiesCount } from '../utils/OffchainUtils';
import { getLoadMoreFn, InnerActivities } from './InnerActivities';
import { Tabs } from 'antd';
import { AccountSpaces, LoadSpacesType } from '../spaces/AccountSpaces';
import { AnyAccountId } from '@subsocial/types';

const { TabPane } = Tabs

const loadMoreActivities = getLoadMoreFn(getActivities)

type ActivitiesByAddressProps = Partial<LoadSpacesType> & {
  address: AnyAccountId
}
export const AddressActivity = ({ address, spacesData, mySpaceIds }: ActivitiesByAddressProps) => {
  return <Tabs>
    <TabPane tab='All' key='all'>
      <InnerActivities
        loadMore={loadMoreActivities}
        address={address.toString()}
        getCount={getActivitiesCount}
      />
    </TabPane>
    <TabPane tab='Spaces' key='spaces'>
      <AccountSpaces address={address} spacesData={spacesData} mySpaceIds={mySpaceIds} />
    </TabPane>
  </Tabs>
}


