import { isEmptyStr } from '@subsocial/utils'
import truncate from 'lodash.truncate'

export const DEFAULT_SUMMARY_LENGTH = 300

export const SEPARATOR = /[.,:;!?()[\]{}\s]+/

/** Shorten a plain text up to `limit` chars. Split by separators. */
export const summarize = (
  text?: string,
  limit: number = DEFAULT_SUMMARY_LENGTH
): string => {
  if (isEmptyStr(text)) return ''

  text = (text as string).trim()

  return text.length <= limit
    ? text
    : truncate(text, {
      length: limit,
      separator: SEPARATOR
    })
}
