import DataList, { DataListProps } from './DataList';
import { useState, useCallback, useEffect } from 'react';
import { Loading, isClientSide } from '../utils';
import { INFINITE_SCROLL_PAGE_SIZE, DEFAULT_FIRST_PAGE } from 'src/config/ListData.config';
import { nonEmptyArr, isEmptyArray } from '@subsocial/utils';
import InfiniteScroll from 'react-infinite-scroll-component';
import ButtonLink from '../utils/ButtonLink';
import { useLinkParams } from './utils';
import { useRouter } from 'next/router';
import { tryParseInt } from 'src/utils';

const DEFAULT_THRESHOLD = isClientSide() ? window.innerHeight / 3 : undefined

const canHaveMoreData = (currentPageItems?: any[]) =>
  currentPageItems
    ? currentPageItems.length >= INFINITE_SCROLL_PAGE_SIZE
    : true

type InfiniteListProps<T> = Partial<DataListProps<T>> & {
  loadMore: (page: number, size: number) => Promise<T[]>
  renderItem: (item: T, index: number) => JSX.Element
  loadingLabel?: string,
  withLoadMoreLink?: boolean // Helpful for SEO
}

export const InfiniteList = <T extends any>(props: InfiniteListProps<T>) => {
  const {
    loadingLabel = 'Loading data...',
    withLoadMoreLink = false,
    dataSource,
    renderItem,
    loadMore,
    ...otherProps
  } = props

  const { query: { page: pagePath } } = useRouter()

  const isInitialData = nonEmptyArr(dataSource)


  const initialPage = pagePath
    ? tryParseInt(pagePath.toString(), DEFAULT_FIRST_PAGE)
    : DEFAULT_FIRST_PAGE

  const [ page, setPage ] = useState(initialPage)
  const [ data, setData ] = useState(dataSource || [])
  const [ hasMore, setHasMore ] = useState(canHaveMoreData(dataSource))
  const [ loading, setLoading ] = useState(false)

  const getLinksParams = useLinkParams({
    defaultSize: INFINITE_SCROLL_PAGE_SIZE,
    triggers: [ page ]
  })

  const handleInfiniteOnLoad = useCallback(async () => {
    setLoading(true)
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)

    if (!canHaveMoreData(newData)) {
      setHasMore(false)
    }

    data.push(...newData)

    setData([ ...data ])
    setPage(page + 1)
    setLoading(false)
  }, [ page ])

  useEffect(() => {
    if (isInitialData) return setPage(page + 1);

    handleInfiniteOnLoad()
  }, [])

  if (!isInitialData && isEmptyArray(data) && loading) return <Loading label={loadingLabel} />

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
        dataSource={data}
        renderItem={renderItem}
      />
      {withLoadMoreLink && !loading && hasMore &&
        <ButtonLink block {...linkProps} className='mb-2'>Load more</ButtonLink>
      }
    </InfiniteScroll>
}
