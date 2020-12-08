export type RowKeyFn<T> = (item: T) => string | string

export type RenderItemFn<T> = (item: T, index: number) => React.ReactNode

export type InnerLoadMoreFn<T> = (page: number, size: number) => Promise<T[]>

export type CanHaveMoreDataFn<T> = (data: T[] | undefined, page: number) => boolean

export type DataListItemProps<T> = {
  getKey: RowKeyFn<T>
  renderItem: RenderItemFn<T>
}