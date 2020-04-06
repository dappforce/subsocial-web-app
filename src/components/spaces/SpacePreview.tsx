import React from 'react'
import { Icon } from 'antd'
import { BlogId } from 'src/components/types'

export type SpaceContent = {
  id: BlogId,
  title: string,
  isFollowing: boolean
}

export interface SpacePreviewProps {
  spaces: SpaceContent[],
  name: string,
  iconType: 'user' | 'file'
}

const SpacePreview = (props: SpacePreviewProps) => {
  const { spaces, name, iconType } = props

  return <div className="SpacePreview">
    <div className="SPHead">{name}</div>
    <div className="SPitems">
      {spaces.map((x) => (
        <div className="SPitem" key={x.id.toString()}>
          <div className="SPitemText"><Icon type={iconType} /> {x.title}</div>
          {/* <FollowBlogButton blogId={blogId} /> */}
        </div>
      ))}
    </div>
  </div>
}

export default SpacePreview
