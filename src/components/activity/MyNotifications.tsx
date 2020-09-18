import React, { useEffect, useState, useMemo, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { Activity } from '@subsocial/types/offchain';
import { getNotifications } from '../utils/OffchainUtils';
import NoData from '../utils/EmptyList';
import NotAuthorized from '../auth/NotAuthorized';
import { HeadMeta } from '../utils/HeadMeta';
import Section from '../utils/Section';
import { useMyAddress } from '../auth/MyAccountContext';
import { Notifications } from './Notification';
import { Loading } from '../utils';

export const MyNotifications = () => {
  const myAddress = useMyAddress()

  const [ items, setItems ] = useState<Activity[]>([]);
  const [ offset, setOffset ] = useState(0);
  const [ hasNextPage, setHasNextPage ] = useState(true);
  const [ loaded, setLoaded ] = useState(false);

  useEffect(() => {
    if (!myAddress) return;
    setLoaded(false)
    getNextPage(0).catch(err => new Error(err)).finally(() => setLoaded(true));

    // TODO fix 'Mark all notifications as read' when user's session key implemented:
    // clearNotifications(myAddress)
  }, [ myAddress ]);

  const getNextPage = useCallback(async (actualOffset: number = offset) => {
    if (!myAddress) return

    const isFirstPage = actualOffset === 0;
    const data = await getNotifications(myAddress, actualOffset, INFINITE_SCROLL_PAGE_SIZE);
    if (data.length < INFINITE_SCROLL_PAGE_SIZE) setHasNextPage(false);
    setItems(isFirstPage ? data : items.concat(data));
    setOffset(actualOffset + INFINITE_SCROLL_PAGE_SIZE);
  }, []);

  const totalCount = (items && items.length) || 0;

  const Content = () => {
    if (!loaded) {
      return <Loading />
    }

    return totalCount === 0
      ? <NoData description='No notifications for you' />
      : infiniteScroll
  }

  const infiniteScroll = useMemo(() =>
    <InfiniteScroll
      dataLength={totalCount}
      next={getNextPage}
      hasMore={hasNextPage}
      // endMessage={<MutedDiv className='DfEndMessage'>You have read all notifications</MutedDiv>}
      loader={<Loading />}
    >
      <Notifications activities={items} />
    </InfiniteScroll>, [ totalCount ])

  if (!myAddress) return <NotAuthorized />;

  return <>
    <HeadMeta title='My Notifications' />
    <Section title={`My Notifications (${totalCount})`}>
      <Content />
    </Section>
  </>
}

export default React.memo(MyNotifications)
