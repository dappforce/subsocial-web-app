import React from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { summarize } from 'src/utils'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { SummarizedContent } from 'src/types'

const MOBILE_SUMMARY_LEN = 120
const DESKTOP_SUMMARY_LEN = 220

type Props = {
  content?: SummarizedContent
  limit?: number
  more?: JSX.Element
}

export const SummarizeMd = React.memo((props: Props) => {
  const { content, limit: initialLimit, more } = props
  const { summary: initialSummary = '', isShowMore = false } = content || {}
  const isMobile = useIsMobileWidthOrDevice()

  if (isEmptyStr(initialSummary)) return null

  const limit = initialLimit
    ? initialLimit
    : (isMobile
      ? MOBILE_SUMMARY_LEN
      : DESKTOP_SUMMARY_LEN
    )

  const summary = summarize(initialSummary, { limit })

  if (isEmptyStr(summary)) return null

  return (
    <div className='DfSummary'>
      {summary}
      {isShowMore && <span className='DfSeeMore'>{' '}{more}</span>}
    </div>
  )
})

export default SummarizeMd
