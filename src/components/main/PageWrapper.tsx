import React from 'react'
import Section from '../utils/Section'
import { useResponsiveSize } from '../responsive'

import Head from 'next/head'
import { isEmptyStr, nonEmptyStr, nonEmptyArr } from '@subsocial/utils'
import { summarize } from 'src/utils'
import { resolveIpfsUrl } from 'src/ipfs'

type HeadMetaProps = {
  title: string,
  desc?: string,
  image?: string,
  canonical?: string,
  tags?: string[]
}

// Google typically displays the first 50–60 characters of a title tag.
// If you keep your titles under 60 characters, our research suggests
// that you can expect about 90% of your titles to display properly.
const MAX_TITLE_LEN = 45
const MAX_DESC_LEN = 300

const SITE_NAME = 'Subsocial Network'

export const DEFAULT_TITLE =
  'Subsocial - decentralized social network on Polkadot & IPFS'

export const DEFAULT_DESC =
  'Subsocial is a Polkadot ecosystem project supported by Web3 Foundation. ' +
  'Subsocial follows SoFi (social finance) principles to bring DeFi features to social networking.'

export const createTitle = (title: string) => {
  if (isEmptyStr(title) || title === DEFAULT_TITLE) {
    return DEFAULT_TITLE
  }

  const leftPart = summarize(title, { limit: MAX_TITLE_LEN })
  return `${leftPart} - Subsocial`
}

const DEFAULT_SUBSOCIAL_IMG = '/subsocial-sign.png'

export function HeadMeta (props: HeadMetaProps) {
  const { title, desc, image, canonical, tags } = props
  const summary = desc ? summarize(desc, { limit: MAX_DESC_LEN }) : DEFAULT_DESC
  const img = nonEmptyStr(image) ? resolveIpfsUrl(image) : DEFAULT_SUBSOCIAL_IMG

  return <div>
    <Head>
      <title>{createTitle(title)}</title>
      <meta name='description' content={summary} />
      {nonEmptyArr(tags) && <meta name='keywords' content={tags?.join(', ')} />}
      {nonEmptyStr(canonical) && <link rel='canonical' href={canonical} />}

      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:image' content={img} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={summary} />

      <meta name='twitter:card' content='summary' />
      <meta name='twitter:site' content={SITE_NAME} />
      <meta name='twitter:image' content={img} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={summary} />
    </Head>
  </div>
}

type Props = {
  meta: HeadMetaProps,
  leftPanel?: React.ReactNode,
  rightPanel?: React.ReactNode,
  level?: number,
  title?: React.ReactNode,
  className?: string
}

export const PageContent: React.FunctionComponent<Props> = ({ leftPanel, rightPanel, meta, level = 1, title, className, children }) => {
  const { isNotMobile } = useResponsiveSize()
  const isPanels = leftPanel || rightPanel
  return <>
    <HeadMeta {...meta} />
    {isNotMobile
    ? <div className='d-flex w-100'>
      {isPanels && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>}
      <Section className={`DfMainContent ${className}`} level={level} title={title} >{children}</Section>
      {isPanels && <div className='DfRightPanel DfPanel'>{rightPanel}</div>}
    </div>
    : <>
      {children}
      {/* {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>} */}
    </>}
  </>
}
