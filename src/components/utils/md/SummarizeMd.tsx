import React, { useState, useEffect } from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { mdToText } from './mdToText'
import { summarize } from '../text'

type Props = {
  md?: string
  limit?: number
  more?: JSX.Element
}

export const SummarizeMd = ({ md, limit, more }: Props) => {
  if (isEmptyStr(md)) return null

  const [ summary, setSummary ] = useState<string>()
  const [ showMore, setShowMore ] = useState<boolean>(false)

  useEffect(() => {
    let isSubscribe = true

    const process = async () => {
      const text = (await mdToText(md))?.trim()
      const summary = summarize(text, limit)
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
