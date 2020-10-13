import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from "src/config/ListData.config"
import { ParsedUrlQuery } from 'querystring'
import { nonEmptyStr } from '@subsocial/utils'
import { tryParseInt } from "src/utils"
import { useCallback } from "react"
import { useRouter } from "next/router"

export type PaginationQuery = {
  page?: number | string
  size?: number | string
}

export const parsePageQuery = (props: ParsedUrlQuery | PaginationQuery) => {
  const { page, size } = props
  return {
    page: nonEmptyStr(page) ? tryParseInt(page, DEFAULT_FIRST_PAGE) : DEFAULT_FIRST_PAGE,
    size: nonEmptyStr(size) ? tryParseInt(size, DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE
  }
}

type ParamsHookProps = {
  trigers?: any[],
  defaultSize: number
}

export const useLinkParams = ({ trigers = [], defaultSize }: ParamsHookProps) => {
  const { pathname, asPath } = useRouter()

  return useCallback((page: number, size?: number) => {
    const query = `page=${page}&size=${size || defaultSize}`
    return {
      href: `${pathname}?${query}`,
      as: `${asPath.split('?')[0]}?${query}`
    }
  }, [ pathname, asPath, ...trigers ])
}
