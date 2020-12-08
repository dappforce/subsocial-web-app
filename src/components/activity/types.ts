import { ParsedPaginationQuery } from '../utils/getIds'
import { ActivityStore } from './NotificationUtils'
import { FlatSubsocialApi } from '../substrate'
import { DataListItemProps } from '../lists'
import { AppDispatch } from 'src/rtk/app/store'
import { SubsocialApi } from '@subsocial/api'

export type LoadMoreProps = ParsedPaginationQuery & {
  flatApi: FlatSubsocialApi
  subsocial: SubsocialApi
  dispatch: AppDispatch
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
