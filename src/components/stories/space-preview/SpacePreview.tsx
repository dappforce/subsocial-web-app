import React from 'react'
import { Icon } from 'antd'
import { BUTTON_SIZE } from '../../../config/Size.config'
import TxButton from '../../utils/TxButton'
import './SpacePreview.css'

type SpaceContent = {
  id: number,
  title: string,
  isFollowed: boolean
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
      {
        spaces.map((x) => (
          <div className="SPitem" key={x.id.toString()}>
            <div className="SPitemText"><Icon type={iconType} /> {x.title}</div>
            {
              x.isFollowed
                ? <TxButton
                  isBasic={false}
                  isPrimary={true}
                  size={BUTTON_SIZE}
                  // onClick={}
                  className="SPbutton unfollowed"
                >
                  Follow
                </TxButton>
                : <TxButton
                  isBasic={true}
                  isPrimary={false}
                  size={BUTTON_SIZE}
                  // onClick={}
                  className="SPbutton"
                >
                  Unfollow
                </TxButton>
            }
          </div>
        ))
      }
    </div>
  </div>
}

export default SpacePreview
