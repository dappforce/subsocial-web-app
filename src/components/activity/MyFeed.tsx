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

type MyFeedProps = {
  withTitle?: boolean
}

export const MyFeed = ({ withTitle }: MyFeedProps) => {
  const myAddress = useMyAddress()
  const { subsocial, isApiReady } = useSubsocialApi()

  const getNextPage = useCallback(async (page: number, size: number) => {
    if (!myAddress || !isApiReady) return undefined

    const offset = (page - 1) * size

    const activity = await getNewsFeed(myAddress, offset, size);
    const postIds = activity.map(x => hexToBn(x.post_id))

    return subsocial.findPublicPostsWithAllDetails(postIds)
  }, [ myAddress, isApiReady ]);

  if (!myAddress) return <NotAuthorized />;

  return <>
    <HeadMeta title='My Feed' />
    <InfiniteList
      dataSource={[] as PostWithAllDetails[]}
      title={withTitle ? 'My feed' : undefined}
      noDataDesc='No posts in your feed yet'
      renderItem={(x, i) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
      loadMore={getNextPage}
      resetTriggers={[ isApiReady ]}
      initialLoad
    />
  </>
}

export default MyFeed
