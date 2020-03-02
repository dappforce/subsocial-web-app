import React from 'react'
import { Button, Menu } from 'antd'
import './SpaceNav.css'
import { ProfileContent, PostId, BlogId } from 'src/components/types'
import SpacePreview from '../SpacePreview/SpacePreview'
import { BUTTON_SIZE } from '../../../config/Size.config';
import { AccountId } from '@polkadot/types'
import TxButton from '../../utils/TxButton'
import { withStorybookContext } from '../withStorybookContext';

interface FilterByTags {
  data: string[]
}

interface SpecificPost {
  data: PostId
}

interface OuterUrl {
  data: string
}

interface SpecificBlog {
  data: BlogId
}

type NavTabContent = FilterByTags | SpecificPost | OuterUrl | SpecificBlog

type ContentType = 'by-tag' | 'ext-url' | 'post-url' | 'blog-url'

interface NavTab {
  id: number
  title: string
  content: NavTabContent
  description: string
  hidden: boolean
  type: ContentType
}

type SpaceContent = {
  id: number,
  title: string,
  isFollowed: boolean
}

export interface SpaceNavProps {
  id: number,
  ProfileContent?: ProfileContent,
  navTabs: NavTab[],
  spaces: {
    teamMembers?: SpaceContent[]
    projects?: SpaceContent[]
  }
  followers?: number[],
}

export const SpaceNav = (props: SpaceNavProps) => {
  const {
    followers,
    ProfileContent = {} as ProfileContent,
    navTabs,
    spaces,
    id
  } = props;

  const {
    avatar,
    fullname,
    about
  } = ProfileContent;

  const renderMenuItem = (nt: NavTab) => {
    switch (nt.type) {
      case 'blog-url': {
        return <Menu.Item key={nt.id}><a href={`/blogs/${nt.content.data.toString()}`}>{nt.title}</a></Menu.Item>
      }
      case 'by-tag': {
        const data = nt.content.data as string[]
        const tags = data.join('+')
        return <Menu.Item key={nt.id}><a href={`/tags/${tags}`}>{nt.title}</a></Menu.Item>
      }
      case 'ext-url': {
        return <Menu.Item key={nt.id}><a href={nt.content.data as string}>{nt.title}</a></Menu.Item>
      }
      case 'post-url': {
        return <Menu.Item key={nt.id}><a href={`/blogs/${id}/posts/${nt.content.data.toString()}`}>{nt.title}</a></Menu.Item>
      }
      default: {
        return undefined
      }
    }
  }

  return <div className="SpaceNav">
    <div className="SNhead">
      <div className="SNavatar">
        <img src={avatar} alt="" />
      </div>
      <div className="SNheadText">
        <div className="SNheadTitle">{fullname}</div>
        <div className="SNheadDescription">{about}</div>
      </div>
      <TxButton
        isBasic={true}
        isPrimary={false}
        size={BUTTON_SIZE}
        // onClick={}
      >
          Follow
      </TxButton>
      {
        followers
          ? <Button type="default" className="SNheadButton">Unfollow</Button>
          : <Button type="primary" className="SNheadButton unfollowed">Follow</Button>
      }
    </div>
    <Menu
      mode="inline"
      className="SNmenu"
    >
      { navTabs.map((x) => renderMenuItem(x)) }
    </Menu>
    {
      spaces.teamMembers &&
        <SpacePreview spaces={spaces.teamMembers} name="Team" icon="user" />
    }
    {
      spaces.projects &&
        <SpacePreview spaces={spaces.projects} name="Projects" icon="file" />
    }
  </div>
}

// export default SpaceNav
export default {
  title: 'SpaceNav',
  decorators: [ withStorybookContext ]
};
