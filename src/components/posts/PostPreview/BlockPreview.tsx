import React from 'react'
import { BlockValueKind, EmbedData, PreviewData } from '../../types'
import { DfMd } from '../../utils/DfMd'
import './BlockPreview.css'
import VideoPreview from './VideoPreview'
import LinkPreview from './LinkPreview'
import CodePreview from './CodePreview'

type Props = {
  block: BlockValueKind
  embedData: EmbedData[]
  setEmbedData: React.Dispatch<React.SetStateAction<EmbedData[]>>
  linkPreviewData: PreviewData[]
}

const BlockPreview = (props: Props) => {
  const { block: x, embedData, setEmbedData, linkPreviewData } = props

  if (x.hidden) return null

  let element

  switch (x.kind) {
    case 'link': {
      element = <LinkPreview
        block={x}
        embedData={embedData}
        linkPreviewData={linkPreviewData}
      />
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
      element = <CodePreview
        block={x}
      />
      break
    }
    case 'video': {
      element = <VideoPreview
        block={x}
        embedData={embedData}
        setEmbedData={setEmbedData}
        linkPreviewData={linkPreviewData}
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