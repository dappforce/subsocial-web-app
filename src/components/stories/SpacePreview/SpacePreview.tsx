import React from 'react'
import { Icon, Button } from 'antd'
import './SpacePreview.css'

type SpaceContent = {
  id: number,
  title: string,
  isFollowed: boolean
}

export interface SpacePreviewProps {
  spaces: SpaceContent[],
  name: string,
  icon: 'user' | 'file'
}

const SpacePreview = (props: SpacePreviewProps) => {
  const { spaces, name, icon } = props

  return <div className="SpacePreview">
    <div className="SPHead">{name}</div>
    <div className="SPitems">
      {
        spaces.map((x) => (
          <div className="SPitem" key={x.id.toString()}>
            <div className="SPitemText"><Icon type={icon} /> {x.title}</div>
            {
              x.isFollowed
                ? <Button type="primary" className="SPbutton unfollowed" >Follow</Button>
                : <Button type="default" className="SPbutton" >Unfollow</Button>
            }
          </div>
        ))
      }
    </div>
  </div>
}

export default SpacePreview
