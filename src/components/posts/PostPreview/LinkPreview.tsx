import React from 'react'
import { isLink, DOMAIN_REGEXP, GIST_REGEXP, TWITTER_REGEXP } from '../../utils'
import { BlockValueKind, EmbedData, PreviewData } from '../../types'
import { Icon } from 'antd'
import Gist from './GistEmbed'
import { Tweet } from 'react-twitter-widgets'

type Props = {
  block: BlockValueKind
  embedData: EmbedData[]
  linkPreviewData: PreviewData[]
}

const LinkPreview = (props: Props) => {
  const { block: x, embedData, linkPreviewData } = props

  const renderEmbed = (embedData: EmbedData) => {
    switch (embedData.type) {
      case 'twitter': {
        return <Tweet options={{ width: '100%' }} tweetId={embedData?.data} />
      }
      case 'default': {
        return <div>Default embed</div>
      }
    }
    return null
  }

  if (!isLink(x.data)) {
    return <div>{x.data}</div>
  }

  if (x.data.match(GIST_REGEXP)) {
    const match = x.data.match(GIST_REGEXP)

    if (match && match[0]) {
      const res = match[0].split('/')
      const file = match[5] || ''
      return <Gist id={res[4]} file={file} />
    }
  }

  if (x.data.match(TWITTER_REGEXP)) {
    const match = x.data.match(TWITTER_REGEXP);
    if (match && match[1]) {
      return renderEmbed({ id: x.id, data: match[1], type: 'twitter' })
    }
  }

  const currentEmbed = embedData.find((y) => y.id === x.id)
  const previewData = linkPreviewData.find((y) => y.id === x.id)

  if (!previewData) return null

  const { data: { og } } = previewData
  if (!og || !og.url) return null

  const domain = x.data.match(DOMAIN_REGEXP)

  return (
    <div>
      <a
        href={x.data}
        target='_blank'
        rel='noopener noreferrer'
      >
        {currentEmbed
          ? renderEmbed(currentEmbed)
          : <div className={'PreviewLinkWrapper'}>
            <div className={`PreviewImgWrapper`}>
              <img src={og?.image} className='DfPostImage LinkImage' />
            </div>
            <div className={'UnderPicture'}>
              <p className='PreviewLinkTitle'><b>{og?.title}</b></p>
              <p className='PreviewDescription'>{og?.description}</p>
              <p className='PreviewLinkAfterDescription'><Icon type='link' /> {domain}</p>
            </div>
          </div>}
      </a>
    </div>
  )
}

export default LinkPreview
