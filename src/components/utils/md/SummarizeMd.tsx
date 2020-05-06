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
    const process = async () => {
      const text = (await mdToText(md))?.trim()
      const summary = summarize(text, limit)
      setSummary(summary)
      if (text && text.length > summary.length) {
        setShowMore(true)
      }
    }

    process()
  }, [ md, limit ])

  if (isEmptyStr(summary)) return null

  return <>
    {summary}
    {showMore && <span className='DfSeeMore'>{' '}{more}</span>}
  </>
}

export default SummarizeMd
