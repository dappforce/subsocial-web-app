import React, { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';
import isEmpty from 'lodash.isempty';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import Section from './Section';
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../config/ListData.config';
import NoData from './EmptyList';
// import { newLogger } from '@subsocial/utils';
// TODO use logger
// const log = newLogger('Data list')

type Props<T extends any> = {
  className?: string,
  dataSource: T[], // TODO add generic type
  renderItem: (item: T, index: number) => JSX.Element,
  title?: React.ReactNode,
  noDataDesc?: React.ReactNode,
  noDataExt?: React.ReactNode
}

// TODO rename to DataList
export function ListData<T extends any> (props: Props<T>) {
  const { dataSource, renderItem, className, title, noDataDesc = null, noDataExt } = props;
  const total = dataSource.length;

  const router = useRouter();
  const routerQuery = router.query;

  const [ currentPage, setCurrentPage ] = useState(DEFAULT_FIRST_PAGE);
  const [ pageSize, setPageSize ] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    let isSubscribe = true;

    if (isEmpty(routerQuery) && isSubscribe) {
      setPageSize(DEFAULT_PAGE_SIZE);
      setCurrentPage(DEFAULT_FIRST_PAGE);
    } else {
      const page = parseInt(routerQuery.page as string, 10);
      const _pageSize = parseInt(routerQuery.size as string, 10);

      if (isSubscribe) {
        setCurrentPage(page > 0 ? page : DEFAULT_PAGE_SIZE);
        setPageSize(_pageSize > 0 && _pageSize < MAX_PAGE_SIZE ? _pageSize : DEFAULT_PAGE_SIZE);
      }
    }

    return () => { isSubscribe = false; };
  }, [ false ]);

  const pageSizeOptions = PAGE_SIZE_OPTIONS.map(x => x.toString());
  const hasNoData = total === 0;
  const noPagination = hasNoData || total <= pageSize;

  const paginationConfig = (): PaginationConfig | undefined => {
    if (noPagination) return undefined

    return {
      current: currentPage,
      defaultCurrent: DEFAULT_FIRST_PAGE,
      onChange: page => {
        setCurrentPage(page);
        routerQuery.page = page.toString();

        Router.push({
          pathname: router.pathname,
          query: routerQuery
        }).catch(console.log);
      },
      pageSize,
      pageSizeOptions,
      showSizeChanger: total > 0,
      onShowSizeChange: (_, size: number) => {
        setPageSize(size);
        routerQuery.size = size.toString();

        Router.push({
          pathname: router.pathname,
          query: routerQuery
        }).catch(console.log);
      }
    }
  }

  const list = hasNoData
    ? <NoData description={noDataDesc}>{noDataExt}</NoData>
    : <List
      className={'DfDataList ' + className}
      itemLayout='vertical'
      size='large'
      pagination={paginationConfig()}
      dataSource={dataSource}
      renderItem={(item, index) =>
        <List.Item key={index}>
          {renderItem(item, index)}
        </List.Item>
      }
    />

  const renderTitle = () =>
    <div className='DfTitle--List'>{title}</div>

  return !title
    ? list
    : <Section title={renderTitle()}>{list}</Section>
}

export default ListData
