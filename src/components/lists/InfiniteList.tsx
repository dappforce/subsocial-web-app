import DataList, { DataListProps } from './DataList';
import { useState, useCallback, useEffect } from 'react';
import { Loading } from '../utils';
import { INFINITE_SCROLL_PAGE_SIZE, DEFAULT_FIRST_PAGE } from 'src/config/ListData.config';
import { isEmptyArray, parseNumStr } from '@subsocial/utils';
import InfiniteScroll from 'react-infinite-scroll-component';
import ButtonLink from '../utils/ButtonLink';
import { useLinkParams } from './utils';
import { useRouter } from 'next/router';

type InfiniteListProps<T> = DataListProps<T> & {
  loadMore: (page: number, size: number) => Promise<T[]>,
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

  const [ data, setData ] = useState(dataSource)
  const [ hasMore, setHasMore ] = useState(true)

  const { query: { page: pathPage } } = useRouter()
  const [ page, setPage ] = useState(pathPage && parseNumStr(pathPage.toString()) || DEFAULT_FIRST_PAGE)
  const [ loading, setLoading ] = useState(false)

  const getLinksParams = useLinkParams({ defaultSize: INFINITE_SCROLL_PAGE_SIZE, trigers: [ page ]})

  const handleInfiniteOnLoad = useCallback(async () => {
    setLoading(true)
    const newData = await loadMore(page, INFINITE_SCROLL_PAGE_SIZE)

    if (newData.length < INFINITE_SCROLL_PAGE_SIZE) {
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
      {hasMore && !loading && <ButtonLink block {...getLinksParams(page + 1)} className='mb-2'>Load more</ButtonLink>}
    </InfiniteScroll>
}
