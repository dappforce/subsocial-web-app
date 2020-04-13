import React from 'react'
import { isLink, YOUTUBE_REGEXP, VIMEO_REGEX, DOMAIN_REGEXP, nonEmptyStr } from '../../utils'
import { BlockValueKind, EmbedData, PreviewData } from '../../types'
import { Icon } from 'antd'

type Props = {
  block: BlockValueKind
  embedData: EmbedData[]
  setEmbedData: React.Dispatch<React.SetStateAction<EmbedData[]>>
  linkPreviewData: PreviewData[]
}

const VideoPreview = (props: Props) => {
  const { block: x, embedData, linkPreviewData, setEmbedData} = props

  const handleEmbed = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, url: string, id: number) => {
    if (!nonEmptyStr(url) || !isLink(url)) return

    let data
    const newArray = [ ...embedData ]
    let type = ''

    if (url.match(YOUTUBE_REGEXP)) {
      e.preventDefault()
      const match = url.match(YOUTUBE_REGEXP);
      if (match && match[2]) {
        data = match[2]
        type = 'youtube'
      }
    }

    if (url.match(VIMEO_REGEX)) {
      e.preventDefault()
      const match = url.match(VIMEO_REGEX);
      if (match && match[3]) {
        data = match[3]
        type = 'vimeo'
      }
    }

    if (!data) return

    const idx = embedData.findIndex((x) => x.id === id)
    if (idx === -1) {
      newArray.push({ id, data, type })
    } else {
      newArray[idx].data = data
    }

    setEmbedData(newArray)
  }

  const renderEmbed = (embedData: EmbedData) => {
    switch (embedData.type) {
      case 'youtube': {
        return <iframe src={`https://www.youtube.com/embed/${embedData?.data}`}
          frameBorder='0'
          allow='autoplay; encrypted-media'
          allowFullScreen
          width='100%'
          height='450px'
          title={`video${embedData?.data}`}
        />
      }
      case 'vimeo': {
        return <iframe src={`https://player.vimeo.com/video/${embedData?.data}?autoplay=1&loop=1&autopause=0`}
          width="100%"
          height="450"
          allow="autoplay; fullscreen"
          frameBorder={0}
        />
      }
      case 'default': {
        return <div>default embed</div>
      }
    }
    return null
  }

  console.log('video block:', x)
  console.log('video embedData:', embedData)
  console.log('video linkPreviewData:', linkPreviewData)


  if (!isLink(x.data)) {
    return <div>{x.data}</div>
  }

  const currentEmbed = embedData.find((y) => y.id === x.id)
  const previewData = linkPreviewData.find((y) => y.id === x.id)

  let match

  if (!previewData) return null
  const { data: { og } } = previewData
  if (!og || !og.url) return null
  if (og?.url.match(YOUTUBE_REGEXP)) match = 'youtube'
  if (og?.url.match(VIMEO_REGEX)) match = 'vimeo'

  const domain = x.data.match(DOMAIN_REGEXP)

  return <div>
    <div>
      <a
        href={x.data}
        target='_blank'
        rel='noopener noreferrer'
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleEmbed(e, x.data as string, x.id)}
      >
        {currentEmbed
          ? renderEmbed(currentEmbed)
          : <div className={'previewLinkWrapper'}>
            <div className={`previewImgWrapper ${match}`}>
              <img src={og?.image} className='DfPostImage linkImage' />
            </div>
            <div className={'underPicture'}>
              <p className='previewLinkTitle'><b>{og?.title}</b></p>
              <p className='previewDescription'>{og?.description}</p>
              <p className='previewLinkAfterDescription'><Icon type="link" /> {domain}</p>
            </div>
          </div>}
      </a>
    </div>
  </div>
}

export default VideoPreview