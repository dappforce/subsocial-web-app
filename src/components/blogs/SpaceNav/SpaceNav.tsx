import React from 'react'
import { Menu } from 'antd'
import { ProfileContent, NavTab, BlogId } from 'src/components/types'
// import SpacePreview from '../space-preview/SpacePreview'
import FollowBlogButton from '../../utils/FollowBlogButton'
import { nonEmptyStr } from '../../utils/index'
import { DfBgImg } from '../../utils/DfBgImg'
import { IdentityIcon } from '@polkadot/ui-app'
import { AccountId } from '@polkadot/types'

type SpaceContent = {
  id: number,
  title: string,
  isFollowed: boolean
}

export interface SpaceNavProps {
  blogId: BlogId,
  ProfileContent?: ProfileContent,
  navTabs?: NavTab[],
  spaces?: {
    teamMembers?: SpaceContent[]
    projects?: SpaceContent[]
  }
  followers?: number[],
  image?: string,
  imageSize?: number,
  account: AccountId,
  name: string,
  desc: string
}

const SpaceNav = (props: SpaceNavProps) => {
  const {
    blogId,
    navTabs,
    imageSize = 200,
    image,
    account,
    name: fullname,
    desc: about
  } = props;

  const hasImage = image && nonEmptyStr(image);

  const renderMenuItem = (nt: NavTab) => {
    switch (nt.type) {
      case 'by-tag': {
        const data = nt.content.data as string[]
        const tags = data.join('+')
        return <Menu.Item key={nt.id}><a href={`/tags/${tags}`}>{nt.title}</a></Menu.Item>
      }
      case 'url': {
        return <Menu.Item key={nt.id}><a href={nt.content.data as string}>{nt.title}</a></Menu.Item>
      }
      default: {
        return undefined
      }
    }
  }

  return <div className="SpaceNav">
    <div className="SNhead">
      <div className="SNavatar">
        {hasImage
          ? <DfBgImg className='DfAvatar' size={imageSize} src={image as string} rounded/>
          : <IdentityIcon className='image' value={account} size={imageSize} />
        }
      </div>
      <div className="SNheadText">
        <div className="SNheadTitle">{fullname}</div>
        <div className="SNheadDescription">{about}</div>
      </div>
      <FollowBlogButton blogId={blogId} />
    </div>
    <Menu
      mode="inline"
      className="SNmenu"
    >
      { navTabs?.map((x) => renderMenuItem(x)) }
    </Menu>
    {/*
      spaces.teamMembers &&
        <SpacePreview spaces={spaces.teamMembers} name="Team" iconType="user" />
    */}
    {/*
      spaces.projects &&
        <SpacePreview spaces={spaces.projects} name="Projects" iconType="file" />
    */}
  </div>
}

export default SpaceNav
