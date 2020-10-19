import React, { useCallback, useState, useEffect } from 'react';
import { hexToBn } from '@polkadot/util';
import { useMyAddress } from '../auth/MyAccountContext';
import NotAuthorized from '../auth/NotAuthorized';
import { getNewsFeed, getFeedCount } from '../utils/OffchainUtils';
import { HeadMeta } from '../utils/HeadMeta';
import { InfiniteList } from '../lists/InfiniteList';
import PostPreview from '../posts/view-post/PostPreview';
import { PostWithAllDetails } from '@subsocial/types';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { Loading } from '../utils';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { isDef, notDef } from '@subsocial/utils';
import { ParsedPaginationQuery } from '../utils/getIds';

const title = 'My feed'
const loadingLabel = 'Loading your feed...'

type MyFeedProps = {
  withTitle?: boolean
}

type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  myAddress?: string
}

const loadMore = async (props: LoadMoreProps) => {
  const { subsocial, myAddress, page, size } = props

  if (!myAddress) return []

  const offset = (page - 1) * size
  const activity = await getNewsFeed(myAddress, offset, size)
  const postIds = activity.map(x => hexToBn(x.post_id))
  const posts = await subsocial.findPublicPostsWithAllDetails(postIds)
  return posts.filter(x => isDef(x.space))
}

export const InnerMyFeed = ({ withTitle }: MyFeedProps) => {
  const myAddress = useMyAddress()
  const { subsocial, isApiReady } = useSubsocialApi()
  const [ totalCount, setTotalCount ] = useState<number>()

  useEffect(() => {
    if (!myAddress) return

    getFeedCount(myAddress)
      .then(setTotalCount)
  })
  const Feed = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={withTitle ? title : undefined}
    totalCount={totalCount || 0}
    noDataDesc='Your feed is empty. Try to follow more spaces ;)'
    renderItem={(x: PostWithAllDetails) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
    loadMore={(page, size) => loadMore({ subsocial, myAddress, page, size })}
  />, [ myAddress, isApiReady, totalCount ])

  if (!isApiReady || notDef(totalCount)) return <Loading label={loadingLabel} />

  if (!myAddress) return <NotAuthorized />

  return <Feed />
}

export const MyFeed = (props: MyFeedProps) => {
  return <>
    <HeadMeta title={title} />
    <InnerMyFeed {...props}/>
  </>
}

export default MyFeed
