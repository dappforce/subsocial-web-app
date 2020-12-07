import { ParsedPaginationQuery } from '../utils/getIds'
import { ActivityStore } from './NotificationUtils'
import { FlatSubsocialApi } from '../substrate'
import { DataListItemProps } from '../lists'

export type LoadMoreProps = ParsedPaginationQuery & {
  flatApi: FlatSubsocialApi
  address?: string,
  activityStore?: ActivityStore
}

type GetCountFn = (account: string) => Promise<number>

export type BaseActivityProps = {
  address: string,
  totalCount?: number,
  title?: string,
}

export type ActivityProps<T> = BaseActivityProps & {
  loadMore: (props: LoadMoreProps) => Promise<T[]>,
  getCount?: GetCountFn,
  noDataDesc?: string,
  loadingLabel?: string
}

export type InnerActivitiesProps<T> = ActivityProps<T> & DataListItemProps<T>
