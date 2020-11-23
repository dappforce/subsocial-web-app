import { isEmptyStr } from '@subsocial/utils'
import truncate from 'lodash.truncate'

const DEFAULT_SUMMARY_LEN = 300

const SEPARATOR = /[.,:;!?()[\]{}\s]+/

type SummarizeOpt = {
  limit?: number,
  omission?: string;
}

/** Shorten a plain text up to `limit` chars. Split by separators. */
export const summarize = (
  text: string,
  {
    limit = DEFAULT_SUMMARY_LEN,
    omission = '...'
  }: SummarizeOpt
): string => {
  if (isEmptyStr(text)) return ''

  text = (text as string).trim()

  return text.length <= limit
    ? text
    : truncate(text, {
      length: limit,
      separator: SEPARATOR,
      omission
    })
}
