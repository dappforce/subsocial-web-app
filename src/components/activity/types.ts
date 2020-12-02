import { ParsedPaginationQuery } from '../utils/getIds'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { ActivityStore } from './NotificationUtils'
import { FlatSubsocialApi } from '../substrate'

export type LoadMoreProps = ParsedPaginationQuery & {
  flatApi: FlatSubsocialApi
  subsocial: SubsocialApi
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

export type InnerActivitiesProps<T> = ActivityProps<T> & {
  renderItem: (item: T, index: number) => JSX.Element,
}
