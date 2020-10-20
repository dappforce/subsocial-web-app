import React, { useCallback, useEffect, useState } from 'react';
import { InfiniteList } from '../lists/InfiniteList';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { PostData, SpaceData, ProfileData, PostWithAllDetails } from '@subsocial/types';
import { ActivityStore, NotificationType } from './NotificationUtils';
import { Loading } from '../utils';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { ParsedPaginationQuery } from '../utils/getIds';
import { notDef } from '@subsocial/utils';
import PostPreview from '../posts/view-post/PostPreview';
import { Notification } from './Notification'

type StructId = string

export type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  address?: string
  activityStore: ActivityStore
}

type GetCountFn = (account: string) => Promise<number>

export type BaseActivityProps = {
  address: string,
  title?: string
}

export type InnerActivitiesProps<T> = BaseActivityProps & {
  loadMore: (props: LoadMoreProps) => Promise<T[]>
  getCount: GetCountFn,
  renderItem: (item: T, index: number) => JSX.Element,
  noDataDesc?: string,
  loadingLabel?: string,
}

export type ActivitiesProps<T> = Omit<InnerActivitiesProps<T>, 'renderItem'>

export function InnerActivities<T> ({ loadMore, address, title, getCount, renderItem, noDataDesc, loadingLabel }: InnerActivitiesProps<T>) {
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ totalCount, setTotalCount ] = useState<number>()

  console.log('totalCount', totalCount)

  useEffect(() => {
    if (!address) return

    getCount(address)
      .then(setTotalCount)
  })

  const activityStore: ActivityStore = {
    spaceById: new Map<StructId, SpaceData>(),
    postById: new Map<StructId, PostData>(),
    ownerById: new Map<StructId, ProfileData>()
  }

  const Activities = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={title ? `${title} (${totalCount})` : null}
    noDataDesc={noDataDesc}
    totalCount={totalCount || 0}
    renderItem={renderItem}
    loadMore={(page, size) => loadMore({ subsocial, address, page, size, activityStore })}
  />, [ address, isApiReady, totalCount ])

  if (!isApiReady || notDef(totalCount)) return <Loading label={loadingLabel} />

  return <Activities />
}

export type FeedActivitiesProps<T> = ActivitiesProps<T>

export const FeedActivities = (props: FeedActivitiesProps<PostWithAllDetails>) => <InnerActivities
  {...props}
  renderItem={(x: PostWithAllDetails) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
/>

export type NotifActivitiesProps<T> = ActivitiesProps<T>

export const NotifActivities = (props: FeedActivitiesProps<NotificationType>) => <InnerActivities
  {...props}
  renderItem={(x: NotificationType, key) => <Notification key={key} {...x} />}
/>
