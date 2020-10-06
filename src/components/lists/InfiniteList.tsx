import { Spin } from 'antd';

import InfiniteScroll from 'react-infinite-scroller';
import DataList, { DataListProps } from './DataList';
import { useState } from 'react';
import { DEFAULT_FIRST_PAGE, INFINITE_SCROLL_PAGE_SIZE } from 'src/config/ListData.config';

type ListProps<T> = Partial<DataListProps<T>>

type InfiniteListProps<T> = ListProps<T> & {
  loadMore: (page: number, size: number) => Promise<T[]>
  initialLoad?: boolean
  customList?: (props: ListProps<T>) => (JSX.Element | null)
  renderItem?: (item: T, index: number) => JSX.Element,
  endMessage?: () => React.ReactNode
}

export const InfiniteList = <T extends any>(props: InfiniteListProps<T>) => {
  const { dataSource = [], loadMore, initialLoad, customList, renderItem, endMessage } = props
  const [ data, setData ] = useState(dataSource)
  const [ loading, setLoading ] = useState(false)
  const [ hasMore, setHasMore ] = useState(true)
  const [ page, setPage ] = useState(DEFAULT_FIRST_PAGE)

  const handleInfiniteOnLoad = async () => {
    setLoading(true)
    console.log('Start loading')
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)

    console.log('new Data', newData)
    setData(data.concat(newData))

    if (newData.length < INFINITE_SCROLL_PAGE_SIZE) {
      endMessage && endMessage()
      setHasMore(false)
    }

    setPage(page + 1)
    setLoading(false)
  };

  return <InfiniteScroll
      initialLoad={initialLoad}
      loadMore={handleInfiniteOnLoad}
      hasMore={hasMore}
    >
      {(loading && hasMore)
        ? <Spin />
        : !renderItem
            ? customList ? customList({ dataSource: data, ...props }) : null
            : <DataList
              dataSource={data}
              renderItem={renderItem}
              {...props}
            />
      }
    </InfiniteScroll>
}
