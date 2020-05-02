import React from 'react'
import Link from 'next/link'
import { Menu, Icon } from 'antd'
import FollowBlogButton from '../utils/FollowBlogButton'
import { nonEmptyStr, nonEmptyArr } from '@subsocial/utils'
import { DfBgImg } from '../utils/DfBgImg'
import { SpaceContent } from '../spaces/SpacePreview'
import BN from 'bn.js'
import AccountId from '@polkadot/types/generic/AccountId'
import { NavTab } from '@subsocial/types/offchain'
import { IdentityIcon } from '@polkadot/react-components'
import { isMyAddress } from '../utils/MyAccountContext'

export interface SpaceNavProps {
  blogId: BN,
  creator: AccountId,
  name: string,
  desc?: string,
  image?: string,
  imageSize?: number,
  followersCount?: number,
  followingCount?: number,
  navTabs?: NavTab[],
  linkedSpaces?: {
    teamMembers?: SpaceContent[]
    projects?: SpaceContent[]
  }
}

export const SpaceNav = (props: SpaceNavProps) => {
  const {
    blogId,
    creator,
    name,
    desc,
    image,
    imageSize = 100,
    navTabs = []
  } = props;

  const renderMenuItem = (nt: NavTab) => {
    switch (nt.type) {
      case 'by-tag': {
        const tags = nt.content.data as string[]
        return (
          <Menu.Item key={nt.id}>
            <a href={`/search?tab=posts&blogId=${blogId}&tags=${tags.join(',')}`}>{nt.title}</a>
          </Menu.Item>
        );
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

  const renderEditMenuLink = () => isMyAddress(creator) &&
    <div className='SpaceNavSettings'>
      <Link
        href='/blogs/[blogId]/space-navigation/edit'
        as={`/blogs/${blogId}/space-navigation/edit`}
      >
        <a className='text-secondary'>
          <Icon type="setting" className='mr-2' />
          Edit Menu
        </a>
      </Link>
    </div>

  return <div className="SpaceNav">
    <div className="SNhead">
      <div className="SNavatar">
        {nonEmptyStr(image)
          ? <DfBgImg className='DfAvatar' size={imageSize} src={image as string} rounded />
          : <IdentityIcon className='image' size={imageSize} value={creator} />
        }
      </div>

      <div className="SNheadTitle">{name}</div>
      <FollowBlogButton blogId={blogId} />
      {nonEmptyStr(desc) && <div className="SNheadDescription">{desc}</div>}
    </div>

    {nonEmptyArr(navTabs) &&
      <Menu mode="inline" className="SNmenu">
        {navTabs.map(renderMenuItem)}
      </Menu>
    }

    {renderEditMenuLink()}

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
