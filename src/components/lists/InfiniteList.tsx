import { message, Spin } from 'antd';

import InfiniteScroll from 'react-infinite-scroller';
import DataList, { DataListProps } from './DataList';
import { useState } from 'react';
import { DEFAULT_FIRST_PAGE, INFINITE_SCROLL_PAGE_SIZE } from 'src/config/ListData.config';


type ListProps<T> = Partial<DataListProps<T>>

type InfiniteListProps<T> = ListProps<T> & {
  loadMore: (page: number, size: number) => Promise<T[]>
  initialLoad?: boolean
  customList?: (props: ListProps<T>) => JSX.Element
  renderItem?: (item: T, index: number) => JSX.Element
}

export const InfiniteList = <T extends any>(props: InfiniteListProps<T>) => {
  const { dataSource = [], loadMore, initialLoad, customList, renderItem } = props
  const [ data, setData ] = useState(dataSource)
  const [ loading, setLoading ] = useState(false)
  const [ hasMore, setHasMore ] = useState(true)
  const [ page, setPage ] = useState(DEFAULT_FIRST_PAGE)

  const handleInfiniteOnLoad = async () => {
    setLoading(true)
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)
    setData(data.concat(newData))

    console.log(newData)

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
          {(loading && hasMore)
            ? (
            <div className="demo-loading-container">
              <Spin />
            </div>
          ) : !renderItem
                ? customList ? customList({ dataSource: data, ...props }) : null
                : <DataList
                  dataSource={data}
                  renderItem={renderItem}
                  {...props}
                />
          }
        </InfiniteScroll>
      </div>
    );
}
