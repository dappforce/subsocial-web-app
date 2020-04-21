import React from 'react'
import { BlockValueKind, EmbedData, PreviewData, ImageBlockValue } from '../../types'
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
      const block = x as ImageBlockValue
      let src = block.data
      const previewData = linkPreviewData.find((y) => y.id === block.id)
      if (previewData) src = previewData.data as any
      element = <div>
        <img className='DfPostImage' src={src} />
        <div className='ImageDescriptionPreview'>{block.description}</div>
      </div>
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