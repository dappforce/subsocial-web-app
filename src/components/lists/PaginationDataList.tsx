import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import isEmpty from 'lodash.isempty';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import Section from 'src/components/utils/Section';
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../config/ListData.config';
import NoData from 'src/components/utils/EmptyList';
// import { newLogger } from '@subsocial/utils';
import BN from 'bn.js'
import Link from 'next/link';
import { resolveBn } from '../utils';

// const log = newLogger(DataList.name)

type Props<T extends any> = {
  totalCount?: BN,
  dataSource: T[], // TODO add generic type
  renderItem: (item: T, index: number) => JSX.Element,
  title?: React.ReactNode,
  noDataDesc?: React.ReactNode,
  noDataExt?: React.ReactNode,
  paginationOff?: boolean,
  className?: string
}

export function DataList<T extends any> (props: Props<T>) {
  const { dataSource, totalCount, renderItem, className, title, noDataDesc = null, noDataExt, paginationOff = false } = props;

  const total = totalCount
    ? resolveBn(totalCount)
    : new BN(dataSource.length)

  const router = useRouter();

  const { query, pathname, asPath } = router
  const { address, ...routerQuery } = query;

  const [ currentPage, setCurrentPage ] = useState(DEFAULT_FIRST_PAGE);
  const [ pageSize, setPageSize ] = useState(DEFAULT_PAGE_SIZE);

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
  const hasData = total.gtn(0);
  const noPagination = !hasData || total.lten(pageSize) || paginationOff;

  const paginationConfig = (): PaginationConfig | undefined => {
    if (noPagination) return undefined

    return {
      current: currentPage,
      total: total.toNumber(),
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
      itemRender: (page, type, original) => type === 'page'
        ? <Link {...getLinksParams(page)}>
          <a>
            {page}
          </a>
        </Link>
        : original
    }
  }

  const list = hasData
    ? <List
      className={'DfDataList ' + className}
      itemLayout='vertical'
      size='large'
      pagination={paginationConfig()}
      dataSource={dataSource}
      renderItem={(item, index) =>
        <List.Item key={`${new Date().getTime()}-${index}`}>
          {renderItem(item, index)}
        </List.Item>
      }
    />
    : <NoData description={noDataDesc}>{noDataExt}</NoData>

  const renderTitle = () =>
    <div className='DfTitle--List'>{title}</div>

  return !title
    ? list
    : <Section title={renderTitle()}>{list}</Section>
}

export default DataList
