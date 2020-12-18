import { ParsedPaginationQuery } from '../utils/getIds'
import { FlatSubsocialApi } from '../substrate'
import { DataListItemProps } from '../lists'
import { AppDispatch } from 'src/rtk/app/store'
import { SubsocialApi } from '@subsocial/api'
import { Activity, EventsName } from '@subsocial/types'

export type LoadMoreProps = ParsedPaginationQuery & {
  flatApi: FlatSubsocialApi
  subsocial: SubsocialApi
  dispatch: AppDispatch
  address?: string,
}

type GetCountFn = (account: string) => Promise<number>

export type LoadMoreFn = (
  myAddress: string,
  offset: number,
  limit: number
) => Promise<Activity[]>

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

export type EventsMsg = {
  [key in EventsName]: string;
};

export type PathLinks = {
  links: {
    href: string,
    as?: string
  }
}