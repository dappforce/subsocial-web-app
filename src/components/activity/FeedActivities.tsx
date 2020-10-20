import React, { useState, useEffect, useCallback } from 'react';
import { hexToBn } from '@polkadot/util';
import { isDef, notDef } from '@subsocial/utils';
import { LoadMoreFn } from './NotificationUtils';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { InfiniteList } from '../lists/InfiniteList';
import { PostWithAllDetails } from '@subsocial/types';
import PostPreview from '../posts/view-post/PostPreview';
import { Loading } from '../utils';
import { InnerActivitiesProps, LoadMoreProps } from './types';

export const getLoadMoreFeedFn = (getActivity: LoadMoreFn) =>
  async (props: LoadMoreProps) => {
    const { subsocial, address, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const activity = await getActivity(address, offset, size)

    const postIds = activity.map(x => hexToBn(x.post_id))
    const posts = await subsocial.findPublicPostsWithAllDetails(postIds)

    return posts.filter(x => isDef(x.space))
  }

export function FeedActivities ({ loadMore, address, title, getCount, noDataDesc, loadingLabel }: InnerActivitiesProps<PostWithAllDetails>) {
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ totalCount, setTotalCount ] = useState<number>()

  useEffect(() => {
    if (!address) return

    getCount(address)
      .then(setTotalCount)
  })

  console.log('totalCount', totalCount)

  const Feed = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={title ? title : undefined}
    totalCount={totalCount || 0}
    noDataDesc={noDataDesc}
    renderItem={(x: PostWithAllDetails) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
    loadMore={(page, size) => loadMore({ subsocial, address, page, size })}
  />, [ address, isApiReady, totalCount ])

  if (!isApiReady || notDef(totalCount)) return <Loading label={loadingLabel} />

  return <Feed />
}


