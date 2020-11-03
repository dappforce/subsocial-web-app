import DataList, { DataListProps } from './DataList';
import { useState, useCallback, useEffect } from 'react';
import { Loading, isClientSide, isServerSide } from '../utils';
import { INFINITE_SCROLL_PAGE_SIZE, DEFAULT_FIRST_PAGE } from 'src/config/ListData.config';
import { nonEmptyArr, isEmptyArray } from '@subsocial/utils';
import InfiniteScroll from 'react-infinite-scroll-component';
import ButtonLink from '../utils/ButtonLink';
import { useLinkParams } from './utils';
import { useRouter } from 'next/router';
import { tryParseInt } from 'src/utils';

const DEFAULT_THRESHOLD = isClientSide() ? window.innerHeight / 3 : undefined

export type RenderItemFn<T> = (item: T, index: number) => JSX.Element
export type InnerLoadMoreFn<T> = (page: number, size: number) => Promise<T[]>
export type CanHaveMoreDataFn<T> = (data: T[] | undefined, page: number) => boolean

type InnerInfiniteListProps<T> = Partial<DataListProps<T>> & {
  loadMore: InnerLoadMoreFn<T>,
  renderItem: RenderItemFn<T>
  totalCount?: number,
  loadingLabel?: string,
  withLoadMoreLink?: boolean // Helpful for SEO
  canHaveMoreData: CanHaveMoreDataFn<T>
}

type InfiniteListPropsByData<T> = Omit<InnerInfiniteListProps<T>, 'canHaveMoreData'>

type InfiniteListByPageProps<T> = InfiniteListPropsByData<T> & {
  totalCount: number,
}

export const InfiniteListByPage = <T extends any>(props: InfiniteListByPageProps<T>) => {
  const {
    totalCount,
  } = props

  const { query: { page: pagePath } } = useRouter()

  const initialPage = pagePath
    ? tryParseInt(pagePath.toString(), DEFAULT_FIRST_PAGE)
    : DEFAULT_FIRST_PAGE

  const offset = (initialPage - 1) * INFINITE_SCROLL_PAGE_SIZE
  const lastPage = Math.ceil((totalCount - offset) / INFINITE_SCROLL_PAGE_SIZE)

  const canHaveMoreData: CanHaveMoreDataFn<T> = (data, page) =>
    data
      ? page ? page < lastPage : false
      : true

  return <InnerInfiniteList {...props} canHaveMoreData={canHaveMoreData} />
}

const canHaveMoreData = (currentPageItems?: any[]) => {
  console.log('currentPageItems:', currentPageItems?.length)
  return currentPageItems
    ? currentPageItems.length >= INFINITE_SCROLL_PAGE_SIZE
    : true
}

export const InfiniteListByData = <T extends any>(props: InfiniteListPropsByData<T>) =>
  <InnerInfiniteList {...props} canHaveMoreData={canHaveMoreData} />

const InnerInfiniteList = <T extends any>(props: InnerInfiniteListProps<T>) => {
  const {
    loadingLabel = 'Loading data...',
    withLoadMoreLink = false,
    dataSource,
    renderItem,
    loadMore,
    totalCount,
    canHaveMoreData,
    ...otherProps
  } = props

  const { query: { page: pagePath } } = useRouter()

  const hasInitialData = nonEmptyArr(dataSource)

  const initialPage = pagePath
    ? tryParseInt(pagePath.toString(), DEFAULT_FIRST_PAGE)
    : DEFAULT_FIRST_PAGE

  const [ page, setPage ] = useState(initialPage)
  const [ data, setData ] = useState(dataSource || [])
  const [ loading, setLoading ] = useState(false)

  const [ hasMore, setHasMore ] = useState(canHaveMoreData(dataSource, page))

  const getLinksParams = useLinkParams({
    defaultSize: INFINITE_SCROLL_PAGE_SIZE,
    triggers: [ page ]
  })

  const handleInfiniteOnLoad = useCallback(async () => {
    setLoading(true)
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)
    data.push(...newData)

    setData([ ...data ])

    if (!canHaveMoreData(data, page)) {
      setHasMore(false)
    }

    console.log('canHaveMoreData:', canHaveMoreData(data, page))
    console.log('On page:', page)

    setPage(page + 1)
    setLoading(false)
  }, [ page ])

  useEffect(() => {
    if (hasInitialData) return setPage(page + 1);

    handleInfiniteOnLoad()
  }, [])

  if (!hasInitialData && isEmptyArray(data) && loading) return <Loading label={loadingLabel} />

  const linkProps = getLinksParams(page + 1)

  return <InfiniteScroll
      dataLength={data.length}
      pullDownToRefreshThreshold={DEFAULT_THRESHOLD}
      next={handleInfiniteOnLoad}
      hasMore={hasMore}
      loader={<Loading label={loadingLabel} />}
    >
      <DataList
        {...otherProps}
        totalCount={totalCount}
        dataSource={data}
        renderItem={renderItem}
      />
      {withLoadMoreLink && !loading && hasMore && isServerSide() &&
        <ButtonLink block {...linkProps} className='mb-2'>Load more</ButtonLink>
      }
    </InfiniteScroll>
}
