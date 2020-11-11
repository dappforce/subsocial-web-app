import React from 'react';
import { List } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import Section from 'src/components/utils/Section';
import NoData from 'src/components/utils/EmptyList';

export type DataListOptProps = {
  title?: React.ReactNode,
  level?: number,
  noDataDesc?: React.ReactNode,
  noDataExt?: React.ReactNode,
  className?: string,
}

export type DataListProps<T extends any> = DataListOptProps & {
  totalCount?: number,
  dataSource: T[],
  renderItem: (item: T, index: number) => JSX.Element,
  paginationConfig?: PaginationConfig,
  children?: React.ReactNode
}

export function DataList<T extends any> (props: DataListProps<T>) {
  const {
    dataSource,
    totalCount,
    renderItem,
    className,
    title,
    level,
    noDataDesc = null,
    noDataExt,
    paginationConfig,
    children
  } = props;

  const total = totalCount || dataSource.length

  const hasData = total > 0;

  const list = hasData
    ? <List
      className={'DfDataList ' + className}
      itemLayout='vertical'
      size='large'
      pagination={paginationConfig}
      dataSource={dataSource}
      renderItem={(item, index) =>
        <List.Item key={`${new Date().getTime()}-${index}`}>
          {renderItem(item, index)}
        </List.Item>
      }
    >
      {children}
    </List>
    : <NoData description={noDataDesc}>{noDataExt}</NoData>

  const renderTitle = () =>
    <div className='DfTitle--List'>{title}</div>

  return !title
    ? list
    : <Section title={renderTitle()} level={level}>{list}</Section>
}

export default DataList
