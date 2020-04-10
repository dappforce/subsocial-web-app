import React, { useEffect, useState } from 'react';
import { Loader } from 'semantic-ui-react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { INFINITE_SCROLL_PAGE_SIZE } from '../../config/ListData.config';
import { hexToBn } from '@polkadot/util';
import { useMyAccount } from '../utils/MyAccountContext';
import { Activity } from '@subsocial/types/offchain';
import { NoData, NotAuthorized } from '../utils/DataList';
import { getNewsFeed } from '../utils/OffchainUtils';
import { HeadMeta } from '../utils/HeadMeta';
import Section from '../utils/Section';
import PostPreview from '../posts/PostPreview';

export const MyFeed = () => {
  const { state: { address: myAddress } } = useMyAccount();

  const [ items, setItems ] = useState<Activity[]>([]);
  const [ offset, setOffset ] = useState(0);
  const [ hasMore, setHasMore ] = useState(true);

  useEffect(() => {
    if (!myAddress) return;

    getNextPage(0).catch(err => new Error(err));
  }, [ myAddress ]);

  if (!myAddress) return <NotAuthorized />;

  const getNextPage = async (actualOffset: number = offset) => {
    const isFirstPage = actualOffset === 0;
    const data = await getNewsFeed(myAddress, actualOffset, INFINITE_SCROLL_PAGE_SIZE);
    console.log('Data', actualOffset, data);
    if (data.length < INFINITE_SCROLL_PAGE_SIZE) setHasMore(false);
    setItems(isFirstPage ? data : items.concat(data));
    setOffset(actualOffset + INFINITE_SCROLL_PAGE_SIZE);
  };

  const totalCount = items && items.length;

  const renderItems = () =>
    items.map((item) => {
      const postId = hexToBn(item.post_id)
      return <PostPreview key={item.id} postId={postId} />
    })

  const renderInfiniteScroll = () =>
    <InfiniteScroll
      dataLength={totalCount}
      next={getNextPage}
      hasMore={hasMore}
      // endMessage={<MutedDiv className='DfEndMessage'>You have read all feed</MutedDiv>}
      loader={<Loader active inline='centered' />}
    >
      {renderItems()}
    </InfiniteScroll>

  return <>
    <HeadMeta title='My Feed' />
    <Section title={`My Feed (${totalCount})`}>
      {totalCount === 0
        ? <NoData description='Your feed is empty' />
        : renderInfiniteScroll()
      }
    </Section>
  </>
}

export default MyFeed
