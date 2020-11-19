import React from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { mdToText, summarize } from 'src/utils'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'

const MOBILE_SUMMARY_LEN = 120
const DESKTOP_SUMMARY_LEN = 220

type Props = {
  md?: string
  limit?: number
  more?: JSX.Element
}

export const SummarizeMd = ({ md, limit: initialLimit, more }: Props) => {
  const isMobile = useIsMobileWidthOrDevice()

  if (isEmptyStr(md)) return null

  const limit = initialLimit
    ? initialLimit
    : (isMobile
      ? MOBILE_SUMMARY_LEN
      : DESKTOP_SUMMARY_LEN
    )

  const getSummary = (s?: string) => !s ? '' : summarize(s, { limit })

  const text = mdToText(md)?.trim() || ''
  const summary = getSummary(text)
  const showMore = text.length > summary.length

  if (isEmptyStr(summary)) return null

  return (
    <div className='DfSummary'>
      {summary}
      {showMore && <span className='DfSeeMore'>{' '}{more}</span>}
    </div>
  )
}

export default SummarizeMd
