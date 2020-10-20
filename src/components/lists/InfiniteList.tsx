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

type InfiniteListProps<T> = Partial<DataListProps<T>> & {
  loadMore: (page: number, size: number) => Promise<T[]>
  renderItem: (item: T, index: number) => JSX.Element,
  totalCount: number,
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
    totalCount,
    ...otherProps
  } = props

  const { query: { page: pagePath } } = useRouter()

  const hasInitialData = nonEmptyArr(dataSource)

  const initialPage = pagePath
    ? tryParseInt(pagePath.toString(), DEFAULT_FIRST_PAGE)
    : DEFAULT_FIRST_PAGE

  const offset = (initialPage - 1) * INFINITE_SCROLL_PAGE_SIZE
  const lastPage = Math.ceil((totalCount - offset) / INFINITE_SCROLL_PAGE_SIZE)

  const [ page, setPage ] = useState(initialPage)
  const [ data, setData ] = useState(dataSource || [])
  const [ loading, setLoading ] = useState(false)

  const canHaveMoreData = () =>
    data
      ? page < lastPage
      : true

  const [ hasMore, setHasMore ] = useState(canHaveMoreData())

  const getLinksParams = useLinkParams({
    defaultSize: INFINITE_SCROLL_PAGE_SIZE,
    triggers: [ page ]
  })

  const handleInfiniteOnLoad = useCallback(async () => {
    setLoading(true)
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)
    data.push(...newData)

    setData([ ...data ])

    if (!canHaveMoreData()) {
      setHasMore(false)
    }

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
