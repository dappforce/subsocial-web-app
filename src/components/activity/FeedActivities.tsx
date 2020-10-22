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
import { SubsocialApi } from '@subsocial/api/subsocial';
import BN from 'bn.js'

export const postsFromActivity = async (subsocial: SubsocialApi, postIds: BN[]) => {
  const posts = await subsocial.findPublicPostsWithAllDetails(postIds)

  return posts.filter(x => isDef(x.space))
}

export const getLoadMoreFeedFn = (getActivity: LoadMoreFn, keyId: 'post_id' | 'comment_id') =>
  async (props: LoadMoreProps) => {
    const { subsocial, address, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const activity = await getActivity(address, offset, size) || []
    const postIds = activity.map(x => hexToBn(x[keyId]))

    return postsFromActivity(subsocial, postIds)
  }

export function FeedActivities ({ loadMore, address, title, getCount, totalCount, loadingLabel, ...props }: InnerActivitiesProps<PostWithAllDetails>) {
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ total, setTotalCount ] = useState<number | undefined>(totalCount)

  useEffect(() => {
    if (!address) return

    getCount
      ? getCount(address).then(setTotalCount)
      : setTotalCount(0)
  }, [])

  const noData = notDef(total)

  const Feed = useCallback(() => <InfiniteList
    {...props}
    loadingLabel={loadingLabel}
    title={title ? `${title} (${total})` : undefined}
    totalCount={total || 0}
    renderItem={(x: PostWithAllDetails) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
    loadMore={(page, size) => loadMore({ subsocial, address, page, size })}
  />, [ address, isApiReady, noData ])

  if (!isApiReady || noData) return <Loading label={loadingLabel} />

  return <Feed />
}


