import React from 'react'
import { List } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import Section from 'src/components/utils/Section'
import NoData from 'src/components/utils/EmptyList'
import { DataListItemProps } from '.'

export type DataListOptProps = {
  title?: React.ReactNode,
  level?: number,
  noDataDesc?: React.ReactNode,
  noDataExt?: React.ReactNode,
  className?: string,
}

export type DataListProps<T extends any> = DataListOptProps & DataListItemProps<T> & {
  totalCount?: number,
  dataSource: T[],
  paginationConfig?: PaginationConfig,
  children?: React.ReactNode
}

export function DataList<T extends any> (props: DataListProps<T>) {
  const {
    dataSource,
    totalCount,
    renderItem,
    getKey,
    className,
    title,
    level,
    noDataDesc = null,
    noDataExt,
    paginationConfig,
    children
  } = props

  const total = totalCount || dataSource.length

  const hasData = total > 0

  const list = hasData
    ? <List
      className={'DfDataList ' + className}
      itemLayout='vertical'
      size='large'
      pagination={paginationConfig}
      dataSource={dataSource}
      rowKey={getKey}
      renderItem={renderItem}
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
