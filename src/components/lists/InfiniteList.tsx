import DataList, { DataListProps } from './DataList';
import { useState, useCallback, useEffect } from 'react';
import { Loading } from '../utils';
import { INFINITE_SCROLL_PAGE_SIZE, DEFAULT_FIRST_PAGE } from 'src/config/ListData.config';
import { isEmptyArray } from '@subsocial/utils';
import InfiniteScroll from 'react-infinite-scroll-component';
import ButtonLink from '../utils/ButtonLink';
import { useLinkParams } from './utils';
import { useRouter } from 'next/router';
import { tryParseInt } from 'src/utils';

const canHaveMoreData = (currentPageItems: any[]) =>
  currentPageItems.length >= INFINITE_SCROLL_PAGE_SIZE

type InfiniteListProps<T> = DataListProps<T> & {
  loadMore: (page: number, size: number) => Promise<T[]>
  loadingLabel?: string
}

export const InfiniteList = <T extends any>(props: InfiniteListProps<T>) => {
  const {
    loadingLabel = 'Loading data...',
    dataSource = [],
    renderItem,
    loadMore,
    ...otherProps
  } = props

  const { query: { page: pagePath } } = useRouter()

  const initialPage = pagePath
    ? tryParseInt(pagePath.toString(), DEFAULT_FIRST_PAGE)
    : DEFAULT_FIRST_PAGE

  const [ page, setPage ] = useState(initialPage)
  const [ data, setData ] = useState(dataSource)
  const [ hasMore, setHasMore ] = useState(canHaveMoreData(data))
  const [ loading, setLoading ] = useState(false)

  const getLinksParams = useLinkParams({
    defaultSize: INFINITE_SCROLL_PAGE_SIZE,
    trigers: [ page ]
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
    if (dataSource.length) return setPage(page + 1);

    handleInfiniteOnLoad()
  }, [])

  if (isEmptyArray(data) && loading) return <Loading label={loadingLabel} />

  const linkProps = getLinksParams(page + 1)

  return <InfiniteScroll
      dataLength={data.length}
      next={handleInfiniteOnLoad}
      hasMore={hasMore}
      loader={<Loading label={loadingLabel} />}
    >
      <DataList
        {...otherProps}
        dataSource={data}
        renderItem={renderItem}
      />
      {hasMore && !loading &&
        <ButtonLink block {...linkProps} className='mb-2'>Load more</ButtonLink>
      }
    </InfiniteScroll>
}
