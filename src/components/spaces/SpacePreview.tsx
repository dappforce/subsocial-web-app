import React from 'react'
import BN from 'bn.js'
import Icon from 'antd/lib/icon'

export type SpaceContent = {
  blogId: BN,
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
        <div className="SPitem" key={x.blogId.toString()}>
          <div className="SPitemText"><Icon type={iconType} /> {x.title}</div>
          {/* <FollowBlogButton blogId={blogId} /> */}
        </div>
      ))}
    </div>
  </div>
}

export default SpacePreview
