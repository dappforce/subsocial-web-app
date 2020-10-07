import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from "src/config/ListData.config"
import { ParsedUrlQuery } from 'querystring'
import { nonEmptyStr } from '@subsocial/utils'
import { tryParseInt } from "src/utils"

export type PaginationQuery = {
  page?: number | string
  size?: number | string
}

export const parsePageQuery = (props: ParsedUrlQuery) => {
  const { page, size } = props
  return {
    page: nonEmptyStr(page) ? tryParseInt(page, DEFAULT_FIRST_PAGE) : DEFAULT_FIRST_PAGE,
    size: nonEmptyStr(size) ? tryParseInt(size, DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE
  }
}
