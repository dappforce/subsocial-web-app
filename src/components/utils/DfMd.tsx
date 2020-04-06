import React from 'react'
import ReactMarkdown from 'react-markdown';
import '../utils/styles/github-markdown.css'

interface Props {
  source?: string
}

export const DfMd = (props: Props) => {
  return <ReactMarkdown className='DfMd markdown-body' source={props.source} linkTarget='_blank' />
}
