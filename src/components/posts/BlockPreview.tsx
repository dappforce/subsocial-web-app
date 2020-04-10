import React from 'react'
import { BlockValueKind, CodeBlockValue, EmbedData, PreviewData } from '../types'
import { nonEmptyStr, isLink, YOUTUBE_REGEXP, VIMEO_REGEX, TWITTER_REGEXP, DOMAIN_REGEXP, GIST_REGEXP } from '../utils'
import { Tweet } from 'react-twitter-widgets'
import { DfMd } from '../utils/DfMd'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/mode/typescript'
import 'brace/mode/scss'
import 'brace/mode/html'
import 'brace/mode/powershell'
import 'brace/mode/rust'
import 'brace/theme/github'
// import Gist from 'react-gist'
import { Icon } from 'antd'
import './BlockPreview.css'

type Props = {
  block: BlockValueKind
  embedData: EmbedData[]
  setEmbedData: React.Dispatch<React.SetStateAction<EmbedData[]>>
  linkPreviewData: PreviewData[]
}

const BlockPreview = (props: Props) => {
  const { block: x, embedData, setEmbedData, linkPreviewData } = props

  if (x.hidden) return null

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
      case 'twitter': {
        return <Tweet options={{
          width: '100%'
        }} tweetId={embedData?.data}/>
      }
      case 'default': {
        return <div>default embed</div>
      }
    }
    return null
  }

  let element

  switch (x.kind) {
    case 'link' || 'video': {
      if (!isLink(x.data)) {
        element = <div>{x.data}</div>
        break
      }

      if (x.data.match(GIST_REGEXP)) {
        const match = x.data.match(GIST_REGEXP)

        if (match && match[0]) {
          // const res = match[0].split('/')
          // const file = match[5] || ''
          element = <div className='gistEmbedWrapper'>{/* <Gist id={res[4]} file={file} /> */}</div>
          break
        }
      }

      if (x.data.match(TWITTER_REGEXP)) {
        const match = x.data.match(TWITTER_REGEXP);
        if (match && match[1]) {
          element = renderEmbed({ id: x.id, data: match[1], type: 'twitter' })
        }
        break
      }

      const currentEmbed = embedData.find((y) => y.id === x.id)
      const previewData = linkPreviewData.find((y) => y.id === x.id)

      let match

      if (!previewData) break
      const { data: { og } } = previewData
      if (!og || !og.url) break
      if (og?.url.match(YOUTUBE_REGEXP)) match = 'youtube'
      if (og?.url.match(VIMEO_REGEX)) match = 'vimeo'

      const domain = x.data.match(DOMAIN_REGEXP)

      element = <div>
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
      break
    }
    case 'text': {
      element = <DfMd source={x.data} />
      break
    }
    case 'image': {
      element = <img className='DfPostImage' src={x.data} />
      break
    }
    case 'code': {
      const { lang } = x as CodeBlockValue
      if (typeof window === 'undefined') {
        element = <pre>{x.data}</pre>
        break
      }

      element = <AceEditor
        mode={lang || 'javascript'}
        theme="github"
        value={x.data}
        name="ace-editor-readonly"
        readOnly={true}
        editorProps={{ $blockScrolling: true }}
        width='100%'
        className={'aceEditor'}
        minLines={1}
        maxLines={9}
      />

      break
    }
    default: {
      element = null
    }
  }

  return <div key={x.id} >
    {element}
  </div>
}

export default BlockPreview
