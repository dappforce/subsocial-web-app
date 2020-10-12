import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import isEmpty from 'lodash.isempty';
import { PaginationConfig } from 'antd/lib/pagination';
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../config/ListData.config';
// import { newLogger } from '@subsocial/utils';
import Link from 'next/link';
import DataList, { DataListProps } from './DataList';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ButtonLink from '../utils/ButtonLink';

// const log = newLogger(DataList.name)

export function PaginatedList<T extends any> (props: DataListProps<T>) {
  const { dataSource, totalCount } = props;

  const total = totalCount || dataSource.length

  const router = useRouter();

  const { query, pathname, asPath } = router
  const { address, ...routerQuery } = query;

  const [ currentPage, setCurrentPage ] = useState(DEFAULT_FIRST_PAGE);
  const [ pageSize, setPageSize ] = useState(DEFAULT_PAGE_SIZE);
  const lastPage = Math.ceil(total / pageSize)

  const getLinksParams = useCallback((page: number, size?: number) => {
    const query = `page=${page}&size=${size || pageSize}`
    return {
      href: `${pathname}?${query}`,
      as: `${asPath.split('?')[0]}?${query}`
    }
  }, [ pathname, asPath, currentPage ])

  useEffect(() => {
    let isSubscribe = true;

    if (isEmpty(routerQuery) && isSubscribe) {
      setPageSize(DEFAULT_PAGE_SIZE);
      setCurrentPage(DEFAULT_FIRST_PAGE);
    } else {
      const page = parseInt(routerQuery.page as string, 10);
      const _pageSize = parseInt(routerQuery.size as string, 10);

      if (isSubscribe) {
        const currentPage = page > 0 ? page : DEFAULT_PAGE_SIZE
        const currentSize = _pageSize > 0 && _pageSize < MAX_PAGE_SIZE ? _pageSize : DEFAULT_PAGE_SIZE
        setCurrentPage(currentPage);
        setPageSize(currentSize);
      }
    }

    return () => { isSubscribe = false; };
  }, [ false ]);

  const pageSizeOptions = PAGE_SIZE_OPTIONS.map(x => x.toString());
  const hasData = total > 0;
  const noPagination = !hasData || total <= pageSize;

  const paginationConfig = (): PaginationConfig | undefined => {
    if (noPagination) return undefined

    return {
      current: currentPage,
      total,
      defaultCurrent: DEFAULT_FIRST_PAGE,
      onChange: page => {
        setCurrentPage(page);
      },
      pageSize,
      pageSizeOptions,
      showSizeChanger: hasData,
      onShowSizeChange: (_, size: number) => {
        setPageSize(size);
        const { href, as } = getLinksParams(currentPage, size)
        router.push(href, as)
      },
      style: { marginBottom: '1rem' },
      itemRender: (page, type, original) => {
        switch(type) {
          case 'page': return <Link {...getLinksParams(page)}><a>{page}</a></Link>
          case 'next': return <ButtonLink {...getLinksParams(currentPage + 1)} disabled={currentPage === lastPage}><RightOutlined /></ButtonLink>
          case 'prev': return <ButtonLink {...getLinksParams(currentPage - 1)} disabled={currentPage === 1}><LeftOutlined /></ButtonLink>
          default: return original
        }
      }
    }
  }

  return <DataList
    paginationConfig={paginationConfig()}
    {...props}
  />
}

export default PaginatedList
