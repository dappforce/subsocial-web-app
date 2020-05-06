import React, { useState, useEffect } from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { summarizeMd } from './summarize'

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
      const summary = await summarizeMd(md, limit)
      setSummary(summary)
      if (md && summary.length < md.length) {
        setShowMore(true)
      }
    }

    process()
  }, [ md, limit ])

  if (isEmptyStr(summary)) return null

  return <>
    {summary}
    {showMore && <>{' '}{more}</>}
  </>
}

export default SummarizeMd
