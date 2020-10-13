import React, { useCallback } from 'react';
import { hexToBn } from '@polkadot/util';
import { useMyAddress } from '../auth/MyAccountContext';
import NotAuthorized from '../auth/NotAuthorized';
import { getNewsFeed } from '../utils/OffchainUtils';
import { HeadMeta } from '../utils/HeadMeta';
import { InfiniteList } from '../lists/InfiniteList';
import PostPreview from '../posts/view-post/PostPreview';
import { PostWithAllDetails } from '@subsocial/types';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { Loading } from '../utils';

type MyFeedProps = {
  withTitle?: boolean
}

export const InnerMyFeed = ({ withTitle }: MyFeedProps) => {
  const myAddress = useMyAddress()
  const { subsocial, isApiReady } = useSubsocialApi()

  const Feed = useCallback(() => <InfiniteList
    dataSource={[] as PostWithAllDetails[]}
    title={withTitle ? 'My feed' : undefined}
    noDataDesc='No posts in your feed yet'
    renderItem={(x) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
    loadMore={async (page: number, size: number) => {
      const offset = (page - 1) * size

      const activity = await getNewsFeed(myAddress as string, offset, size);
      const postIds = activity.map(x => hexToBn(x.post_id))

      return subsocial.findPublicPostsWithAllDetails(postIds)
    }}
  />, [ myAddress, isApiReady ])

  if (!isApiReady) return <Loading />

  if (!myAddress) return <NotAuthorized />;

  return <Feed />
}

export const MyFeed = (props: MyFeedProps) => {
  return <>
    <HeadMeta title='My Feed' />
    <InnerMyFeed {...props}/>
  </>
}

export default MyFeed
