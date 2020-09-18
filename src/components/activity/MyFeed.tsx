import React, { useEffect, useState, useMemo, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { hexToBn } from '@polkadot/util';
import { useMyAddress } from '../auth/MyAccountContext';
import { Activity } from '@subsocial/types/offchain';
import NoData from '../utils/EmptyList';
import NotAuthorized from '../auth/NotAuthorized';
import { getNewsFeed } from '../utils/OffchainUtils';
import { HeadMeta } from '../utils/HeadMeta';
import Section from '../utils/Section';
import { PostPreviewList } from '../posts/view-post/PostPreviewList';
import { Loading } from '../utils';

export const MyFeed = () => {
  const myAddress = useMyAddress()

  const [ items, setItems ] = useState<Activity[]>([]);
  const [ offset, setOffset ] = useState(0);
  const [ hasMore, setHasMore ] = useState(true);

  useEffect(() => {
    if (!myAddress) return;

    getNextPage(0).catch(err => new Error(err));
  }, [ myAddress ]);

  const getNextPage = useCallback(async (actualOffset: number = offset) => {
    if (!myAddress) return

    const isFirstPage = actualOffset === 0;
    const data = await getNewsFeed(myAddress, actualOffset, INFINITE_SCROLL_PAGE_SIZE);
    if (data.length < INFINITE_SCROLL_PAGE_SIZE) setHasMore(false);
    setItems(isFirstPage ? data : items.concat(data));
    setOffset(actualOffset + INFINITE_SCROLL_PAGE_SIZE);
  }, [ myAddress ]);

  const totalCount = items && items.length;

  const postIds = items.map(x => hexToBn(x.post_id))

  const infiniteScroll = useMemo(() =>
    <InfiniteScroll
      dataLength={totalCount}
      next={getNextPage}
      hasMore={hasMore}
      // endMessage={<MutedDiv className='DfEndMessage'>You have read all feed</MutedDiv>}
      loader={<Loading />}
    >
      <PostPreviewList postIds={postIds} />
    </InfiniteScroll>, [ totalCount ])

  if (!myAddress) return <NotAuthorized />;

  return <>
    <HeadMeta title='My Feed' />
    <Section title={`My Feed (${totalCount})`}>
      {totalCount === 0
        ? <NoData description='Your feed is empty' />
        : infiniteScroll
      }
    </Section>
  </>
}

export default React.memo(MyFeed)
