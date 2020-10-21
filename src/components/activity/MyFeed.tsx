import { getLoadMoreFeedFn, FeedActivities } from "./FeedActivities"
import { getNewsFeed } from "../utils/SubsocialConnect"
import { BaseActivityProps } from "./types"
import { getFeedCount } from "../utils/OffchainUtils"
import { useMyAddress } from "../auth/MyAccountContext"
import NotAuthorized from "../auth/NotAuthorized"
import HeadMeta from "../utils/HeadMeta"

const TITLE = 'My feed'
const loadingLabel = 'Loading your feed...'

type MyFeedProps = {
  title?: string
}

const loadMoreFeed = getLoadMoreFeedFn(getNewsFeed, 'post_id')

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
