import React, { useState, useEffect } from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { mdToText, mdToTextAsync, summarize } from 'src/utils'
import { useResponsiveSize } from 'src/components/responsive'

const MOBILE_SUMMARY_LEN = 120
const DESKTOP_SUMMARY_LEN = 220

type Props = {
  md?: string
  limit?: number
  more?: JSX.Element
}

export const SummarizeMd = ({ md, limit: initialLimit, more }: Props) => {
  const { isMobile } = useResponsiveSize()

  if (isEmptyStr(md)) return null

  const limit = initialLimit
    ? initialLimit
    : (isMobile
      ? MOBILE_SUMMARY_LEN
      : DESKTOP_SUMMARY_LEN
    )

  const getSummary = (s?: string) => !s ? '' : summarize(s, limit)

  // Here we get the first version of markdown to text.
  // It is not perfect but sync. and this allows us to return a result immediately
  // - this is important for SEO via server-side rendering.
  const syncSummary = getSummary(mdToText(md))

  const [ summary, setSummary ] = useState<string>(syncSummary)
  const [ showMore, setShowMore ] = useState<boolean>(false)

  useEffect(() => {
    let isSubscribe = true

    const process = async () => {
      // Here we get a async version of summary by using another async function
      // of markdown to text. Its output is better, but async.
      // That's why we call it in useEffect.
      const text = (await mdToTextAsync(md))?.trim()
      const summary = getSummary(text)
      isSubscribe && setSummary(summary)
      if (isSubscribe && text && text.length > summary.length) {
        setShowMore(true)
      }
    }

    process()

    return () => { isSubscribe = false }
  }, [ md, limit ])

  if (isEmptyStr(summary)) return null

  return (
    <div className='DfSummary'>
      {summary}
      {showMore && <span className='DfSeeMore'>{' '}{more}</span>}
    </div>
  )
}

export default SummarizeMd
