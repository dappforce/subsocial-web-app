import { message, Spin } from 'antd';

import InfiniteScroll from 'react-infinite-scroller';
import DataList, { DataListProps } from './DataList';
import { useState } from 'react';
import { DEFAULT_FIRST_PAGE, INFINITE_SCROLL_PAGE_SIZE } from 'src/config/ListData.config';


type InfiniteListProps<T> = DataListProps<T> & {
  loadMore: (page: number, size: number) => Promise<T[]>,
  initialLoad?: boolean,
}

export const InfiniteList = <T extends any>(props: InfiniteListProps<T>) => {
  const { dataSource = [], loadMore, initialLoad } = props
  const [ data, setData ] = useState(dataSource)
  const [ loading, setLoading ] = useState(false)
  const [ hasMore, setHasMore ] = useState(true)
  const [ page, setPage ] = useState(DEFAULT_FIRST_PAGE)

  const handleInfiniteOnLoad = async () => {
    setLoading(true)
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)
    setData(data.concat(newData))

    if (newData.length < INFINITE_SCROLL_PAGE_SIZE) {
      message.warning('Infinite List loaded all');
      setHasMore(false)
    }

    setPage(page + 1)
    setLoading(false)
  };

  return (
      <div className="demo-infinite-container">
        <InfiniteScroll
          initialLoad={initialLoad}
          pageStart={0}
          loadMore={handleInfiniteOnLoad}
          hasMore={loading && hasMore}
          useWindow={false}
        >
          <DataList
            {...props}
          >
            {loading && hasMore && (
              <div className="demo-loading-container">
                <Spin />
              </div>
            )}
          </DataList>
        </InfiniteScroll>
      </div>
    );
}
