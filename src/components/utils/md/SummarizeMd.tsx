import React, { useState, useEffect } from 'react'
import { isEmptyStr } from '@subsocial/utils'
import { summarizeMd } from './summarize'

type Props = {
  md?: string
  limit?: number
}

export const SummarizeMd = ({ md, limit }: Props) => {
  const [ summary, setSummary ] = useState<string>()

  useEffect(() => {
    if (isEmptyStr(md)) return

    const process = async () => {
      setSummary(await summarizeMd(md, limit))
    }

    process()
  }, [ md, limit ])

  return <>{summary}</>
}

export default SummarizeMd
