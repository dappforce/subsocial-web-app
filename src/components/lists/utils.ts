import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from "src/config/ListData.config"
import { ParsedUrlQuery } from 'querystring';
import { nonEmptyStr } from '@subsocial/utils';

export type PaginationQuery = {
  size?: number | string,
  page?: number | string
}

export const parsePageQuery = (props: ParsedUrlQuery) => {
  const { page, size } = props
  return {
    page: nonEmptyStr(page) ? parseInt(page) : DEFAULT_FIRST_PAGE,
    size: nonEmptyStr(size) ? parseInt(size) : DEFAULT_PAGE_SIZE
  }
}
