import React, {  } from 'react';
import { getActivities, getActivitiesCount, getReactionActivitiesCount, getReactionActivities, getCommentActivities, getPostActivities, getPostActivitiesCount, getCommentActivitiesCount } from '../utils/OffchainUtils';
import { Tabs } from 'antd';
import { AccountSpaces, LoadSpacesType } from '../spaces/AccountSpaces';
import { AnyAccountId } from '@subsocial/types';
import { getLoadMoreNotificationsFn, NotifActivities } from './Notifications';
import { BaseActivityProps } from './types';
import { getLoadMoreFeedFn, FeedActivities } from './FeedActivities';

const { TabPane } = Tabs


type ActivitiesByAddressProps = Partial<LoadSpacesType> & {
  address: AnyAccountId
}

const loadMoreActivities = getLoadMoreNotificationsFn(getActivities)

const AllActivities = ({ address }: BaseActivityProps) => <NotifActivities
  loadMore={loadMoreActivities}
  address={address}
  noDataDesc='No activities yet'
  getCount={getActivitiesCount}
/>

const loadMoreReaction = getLoadMoreNotificationsFn(getReactionActivities)

const ReactionActivities = ({ address }: BaseActivityProps) => <NotifActivities
  loadMore={loadMoreReaction}
  address={address}
  noDataDesc='No reaction activities yet'
  getCount={getReactionActivitiesCount}
/>

const loadMoreComment = getLoadMoreFeedFn(getCommentActivities)

const CommentActivities = ({ address }: BaseActivityProps) => <FeedActivities
  loadMore={loadMoreComment}
  address={address}
  noDataDesc='No comments activities yet'
  getCount={getCommentActivitiesCount}
/>

const loadMorePost = getLoadMoreFeedFn(getPostActivities)

const PostActivities = ({ address }: BaseActivityProps) => <FeedActivities
  loadMore={loadMorePost}
  address={address}
  noDataDesc='No post activities yet'
  getCount={getPostActivitiesCount}
/>

export const AddressActivity = ({ address, spacesData, mySpaceIds }: ActivitiesByAddressProps) => {
  return <Tabs>
    <TabPane tab='All' key='all'>
      <AllActivities address={address.toString()} />
    </TabPane>
    <TabPane tab='Reaction' key='reaction'>
      <ReactionActivities address={address.toString()} />
    </TabPane>
    <TabPane tab='Posts' key='posts'>
      <PostActivities address={address.toString()} />
    </TabPane>
    <TabPane tab='Comments' key='comments'>
      <CommentActivities address={address.toString()} />
    </TabPane>
    <TabPane tab='Spaces' key='spaces'>
      <AccountSpaces address={address} spacesData={spacesData} mySpaceIds={mySpaceIds} />
    </TabPane>
  </Tabs>
}


