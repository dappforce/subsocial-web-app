import React, { useState, useEffect } from 'react';
import { getActivities, getReactionActivities, getCommentActivities, getPostActivities, getFollowActivities, getActivityCounts } from '../utils/OffchainUtils';
import { Tabs } from 'antd';
import { AccountSpaces, LoadSpacesType } from '../spaces/AccountSpaces';
import { AnyAccountId, Counts } from '@subsocial/types';
import { getLoadMoreNotificationsFn, NotifActivities } from './Notifications';
import { BaseActivityProps } from './types';
import { getLoadMoreFeedFn, FeedActivities } from './FeedActivities';
import { Loading } from '../utils';

const { TabPane } = Tabs

type ActivitiesByAddressProps = Partial<LoadSpacesType> & {
  address: AnyAccountId
}

const loadMoreActivities = getLoadMoreNotificationsFn(getActivities, 'activities')

const AllActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  loadMore={loadMoreActivities}
  noDataDesc='No activities yet'
  loadingLabel='Loading activities...'
/>

const loadMoreReaction = getLoadMoreNotificationsFn(getReactionActivities, 'activities')

const ReactionActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  loadMore={loadMoreReaction}
  noDataDesc='No reaction activities yet'
  loadingLabel='Loading reactions...'
/>

const loadMoreFollow = getLoadMoreNotificationsFn(getFollowActivities, 'activities')

const FollowActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  loadMore={loadMoreFollow}
  noDataDesc='No follow activities yet'
  loadingLabel='Loading follows...'
/>

const loadMoreComment = getLoadMoreFeedFn(getCommentActivities, 'comment_id')

const CommentActivities = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMoreComment}
  noDataDesc='No comments activities yet'
  loadingLabel='Loading comments...'
/>

const loadMorePost = getLoadMoreFeedFn(getPostActivities, 'post_id')

const PostActivities = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMorePost}
  noDataDesc='No post activities yet'
  loadingLabel='Loading posts...'
/>

export const AccountActivity = ({ address, spacesData, mySpaceIds }: ActivitiesByAddressProps) => {
  const [ counts, setCounts ] = useState<Counts>()

  useEffect(() => {
    if (!address) return

    getActivityCounts(address.toString()).then(setCounts)
  }, [ address ])

  if (!counts) return <Loading label='Loading activities...' />

  const { postsCount, commentsCount, reactionsCount, followsCount, activitiesCount } = counts

  const spacesCount = mySpaceIds?.length || 0

  const getTabTitle = (title: string, count: number) => `${title} (${count})`

  return <Tabs>
    <TabPane tab={getTabTitle('Posts', postsCount)} key='posts'>
      <PostActivities address={address.toString()} totalCount={postsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Comments', commentsCount)} key='comments'>
      <CommentActivities address={address.toString()} totalCount={commentsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Reactions', reactionsCount)} key='reactions'>
      <ReactionActivities address={address.toString()} totalCount={reactionsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Follows', followsCount)} key='follows'>
      <FollowActivities address={address.toString()} totalCount={followsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Spaces', spacesCount)} key='spaces'>
      <AccountSpaces address={address} spacesData={spacesData} mySpaceIds={mySpaceIds} withTitle={false} />
    </TabPane>
    <TabPane tab={getTabTitle('All', activitiesCount)} key='all'>
      <AllActivities address={address.toString()} totalCount={activitiesCount} />
    </TabPane>
  </Tabs>
}


