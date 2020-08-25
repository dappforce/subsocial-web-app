import React from 'react'
import { PageContent } from 'src/components/main/PageWrapper'
import HeadMeta from './HeadMeta'

type Props = {
  title: string
  html: string
}

/** Use this component carefully and not to oftern, because it allows to inject a dangerous HTML. */
export const HtmlPage = ({ title, html }: Props) =>
  <PageContent>
    <HeadMeta title={title} />
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </PageContent>

export default HtmlPage
