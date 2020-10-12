import DataList, { DataListProps } from './DataList';
import { useState, useCallback, useEffect } from 'react';
import { Loading } from '../utils';
import { INFINITE_SCROLL_PAGE_SIZE, DEFAULT_FIRST_PAGE } from 'src/config/ListData.config';
import { isEmptyArray } from '@subsocial/utils';
import InfiniteScroll from 'react-infinite-scroll-component';

type InfiniteListProps<T> = DataListProps<T> & {
  loadMore: (page: number, size: number) => Promise<T[]>
  initialLoad?: boolean
  resetTriggers?: any[]
}

export const InfiniteList = <T extends any>(props: InfiniteListProps<T>) => {
  const {
    dataSource = [],
    loadMore,
    initialLoad = false,
    renderItem,
    resetTriggers = [],
    ...otherProps
  } = props

  const [ data, setData ] = useState(dataSource)
  const [ hasMore, setHasMore ] = useState(true)
  const [ page, setPage ] = useState(DEFAULT_FIRST_PAGE)

  const handleInfiniteOnLoad = useCallback(async () => {
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)

    if (newData.length < INFINITE_SCROLL_PAGE_SIZE) {
      setHasMore(false)
    }

    data.push(...newData)

    setData([ ...data ])
    setPage(page + 1)
  }, [ page ])

  useEffect(() => { handleInfiniteOnLoad() }, [])

  if (isEmptyArray(data) && page === 1) return <Loading />

  return <InfiniteScroll
      dataLength={data.length}
      next={handleInfiniteOnLoad}
      hasMore={hasMore}
      loader={<Loading />}
    >
        <DataList
          {...otherProps}
          dataSource={data}
          renderItem={renderItem}
        />
    </InfiniteScroll>
}
