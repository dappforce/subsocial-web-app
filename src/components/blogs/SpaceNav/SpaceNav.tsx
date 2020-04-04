import React from 'react'
import { Menu, Icon } from 'antd'
import { NavTab, BlogId } from 'src/components/types'
// import SpacePreview from '../space-preview/SpacePreview'
import FollowBlogButton from '../../utils/FollowBlogButton'
import { nonEmptyStr } from '../../utils/index'
import { DfBgImg } from '../../utils/DfBgImg'
import { IdentityIcon } from '@polkadot/ui-app'
import { AccountId } from '@polkadot/types'
import Router from 'next/router';

type SpaceContent = {
  id: number,
  title: string,
  isFollowed: boolean
}

export interface SpaceNavProps {
  blogId: BlogId,
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
        const tags = nt.content.data as string[]
        return <Menu.Item key={nt.id}><a href={`/tags/${tags.join(',')}`}>{nt.title}</a></Menu.Item>
      }
      case 'url': {
        const url = nt.content.data as string
        return <Menu.Item key={nt.id}><a href={url}>{nt.title}</a></Menu.Item>
      }
      default: {
        return undefined
      }
    }
  }

  const goToSpaceNavEdit = () => {
    Router.push(`/blogs/${blogId.toString()}/space-navigation/edit`).catch(console.log);
  };

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
    <Menu mode="inline" className="SNmenu">
      <div className='SpaceNavSettings'>
        <Icon type="setting" onClick={goToSpaceNavEdit} />
        <div className="spaceEditTooltip">Edit Menu</div>
      </div>
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
