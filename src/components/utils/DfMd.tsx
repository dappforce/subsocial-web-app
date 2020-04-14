import React from 'react'
import ReactMarkdown from 'react-markdown';

interface Props {
  source?: string
}

export const DfMd = (props: Props) => {
  return <ReactMarkdown className='markdown-body' source={props.source} linkTarget='_blank' />
}
