import InfiniteScroll from 'react-infinite-scroller';
import DataList, { DataListProps } from './DataList';
import { useState, useEffect, useCallback } from 'react';
import { useMyAddress } from '../auth/MyAccountContext';
import { Loading } from '../utils';
import { INFINITE_SCROLL_PAGE_SIZE, DEFAULT_FIRST_PAGE } from 'src/config/ListData.config';
import { isEmptyArray } from '@subsocial/utils';

type ListProps<T> = Partial<DataListProps<T>>

type InfiniteListProps<T> = ListProps<T> & {
  loadMore: (page: number, size: number) => Promise<T[] | undefined>
  initialLoad?: boolean
  customList?: (props: ListProps<T>) => (JSX.Element | null)
  renderItem?: (item: T, index: number) => JSX.Element,
  endMessage?: () => React.ReactNode,
  resetTriggers?: any[]
}

export const InfiniteList = <T extends any>(props: InfiniteListProps<T>) => {
  const { dataSource = [], loadMore, initialLoad = false, customList, renderItem, endMessage, resetTriggers = [], ...otherProps } = props
  const [ data, setData ] = useState(dataSource || [])
  const [ loading, setLoading ] = useState(true)
  const [ hasMore, setHasMore ] = useState(true)
  const [ page, setPage ] = useState(DEFAULT_FIRST_PAGE);
  const myAddress = useMyAddress()

  useEffect(() => {
    setLoading(true)
    setHasMore(true)
    setPage(1)
    setData([])
  }, [ myAddress ])

  const handleInfiniteOnLoad = useCallback(async () => {
    setLoading(true)
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)

    if (!newData) return;

    setData(data.concat(newData))

    if (newData.length < INFINITE_SCROLL_PAGE_SIZE) {
      endMessage && endMessage()
      setHasMore(false)
    }

    setPage(page + 1)
    setLoading(false)

  }, [ myAddress, page, ...resetTriggers ])

  return <InfiniteScroll
      loadMore={handleInfiniteOnLoad}
      hasMore={hasMore}
    >
      {isEmptyArray(data) && loading
        ? <Loading />
        : !renderItem
          ? customList ? customList({ dataSource: data, ...otherProps }) : null
          : <DataList
            {...otherProps}
            dataSource={data}
            renderItem={renderItem}
            >
              {loading && hasMore && <Loading />}
            </DataList>}
    </InfiniteScroll>
}
