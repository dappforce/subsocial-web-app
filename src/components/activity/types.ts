import { ParsedPaginationQuery } from "../utils/getIds"
import { SubsocialApi } from "@subsocial/api/subsocial"
import { ActivityStore } from "./NotificationUtils"

export type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  address?: string
  activityStore?: ActivityStore
}

type GetCountFn = (account: string) => Promise<number>

export type BaseActivityProps = {
  address: string,
  title?: string
}

export type InnerActivitiesProps<T> = BaseActivityProps & {
  loadMore: (props: LoadMoreProps) => Promise<T[]>
  getCount: GetCountFn,
  noDataDesc?: string,
  loadingLabel?: string,
}
