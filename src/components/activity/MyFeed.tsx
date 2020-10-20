import React, {  } from 'react';
import { hexToBn } from '@polkadot/util';
import { useMyAddress } from '../auth/MyAccountContext';
import NotAuthorized from '../auth/NotAuthorized';
import { getNewsFeed, getFeedCount } from '../utils/OffchainUtils';
import { HeadMeta } from '../utils/HeadMeta';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { isDef } from '@subsocial/utils';
import { ParsedPaginationQuery } from '../utils/getIds';
import { BaseActivityProps, FeedActivities } from './InnerActivities';

const TITLE = 'My feed'
const loadingLabel = 'Loading your feed...'

type MyFeedProps = {
  title?: string
}

type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  myAddress?: string
}

const loadMoreFeed = async (props: LoadMoreProps) => {
  const { subsocial, myAddress, page, size } = props

  if (!myAddress) return []

  const offset = (page - 1) * size
  const activity = await getNewsFeed(myAddress, offset, size)
  const postIds = activity.map(x => hexToBn(x.post_id))
  const posts = await subsocial.findPublicPostsWithAllDetails(postIds)
  return posts.filter(x => isDef(x.space))
}

// export const InnerMyFeed = ({ withTitle }: MyFeedProps) => {
//   const myAddress = useMyAddress()
//   const { subsocial, isApiReady } = useSubsocialApi()
//   const [ totalCount, setTotalCount ] = useState<number>()

//   useEffect(() => {
//     if (!myAddress) return

//     getFeedCount(myAddress)
//       .then(setTotalCount)
//   })
//   const Feed = useCallback(() => <InfiniteList
//     loadingLabel={loadingLabel}
//     title={withTitle ? title : undefined}
//     totalCount={totalCount || 0}
//     noDataDesc='Your feed is empty. Try to follow more spaces ;)'
//     renderItem={(x: PostWithAllDetails) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
//     loadMore={(page, size) => loadMore({ subsocial, myAddress, page, size })}
//   />, [ myAddress, isApiReady, totalCount ])

//   if (!isApiReady || notDef(totalCount)) return <Loading label={loadingLabel} />

//   if (!myAddress) return <NotAuthorized />

//   return <Feed />
// }

export const InnerMyFeed = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMoreFeed}
  loadingLabel={loadingLabel}
  noDataDesc='Your feed is empty. Try to follow more spaces ;)'
  getCount={getFeedCount}
/>

export const MyFeed = ({ title }: MyFeedProps) => {
  const myAddress = useMyAddress()

  if (!myAddress) return <NotAuthorized />

  return <>
    <HeadMeta title={TITLE} />
    <InnerMyFeed title={title} address={myAddress} />
  </>
}

export default MyFeed
