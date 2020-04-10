import React, { useEffect, useState } from 'react';
import { Loader } from 'semantic-ui-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { Activity } from '@subsocial/types/offchain';
import { clearNotifications, getNotifications } from '../utils/OffchainUtils';
import { NoData, NotAuthorized } from '../utils/DataList';
import { HeadMeta } from '../utils/HeadMeta';
import Section from '../utils/Section';
import { useMyAccount } from '../utils/MyAccountContext';
import { Notification } from './Notification';

export const MyNotifications = () => {
  const { state: { address: myAddress } } = useMyAccount();

  const [ items, setItems ] = useState<Activity[]>([]);
  const [ offset, setOffset ] = useState(0);
  const [ hasNextPage, setHasNextPage ] = useState(true);

  useEffect(() => {
    if (!myAddress) return;

    getNextPage(0).catch(err => new Error(err));
    clearNotifications(myAddress)
  }, [ myAddress ]);

  if (!myAddress) return <NotAuthorized />;

  const getNextPage = async (actualOffset: number = offset) => {
    const isFirstPage = actualOffset === 0;
    const data = await getNotifications(myAddress, actualOffset, INFINITE_SCROLL_PAGE_SIZE);
    if (data.length < INFINITE_SCROLL_PAGE_SIZE) setHasNextPage(false);
    setItems(isFirstPage ? data : items.concat(data));
    setOffset(actualOffset + INFINITE_SCROLL_PAGE_SIZE);
  };

  const totalCount = items && items.length;

  const renderItems = () =>
    items.map((item) =>
      <Notification key={item.id} activity={item} />)

  const renderInfiniteScroll = () =>
    <InfiniteScroll
      dataLength={totalCount}
      next={getNextPage}
      hasMore={hasNextPage}
      // endMessage={<MutedDiv className='DfEndMessage'>You have read all notifications</MutedDiv>}
      loader={<Loader active inline='centered' />}
    >
      {renderItems()}
    </InfiniteScroll>

  return <>
    <HeadMeta title='My Notifications' />
    <Section title={`My Notifications (${totalCount})`}>
      {totalCount === 0
        ? <NoData description='No notifications for you' />
        : renderInfiniteScroll()
      }
    </Section>
  </>
}

export default MyNotifications
