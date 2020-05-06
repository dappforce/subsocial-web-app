import { IdentityIcon } from '@polkadot/react-components';
import AccountId from '@polkadot/types/generic/AccountId';
import { NavTab } from '@subsocial/types/offchain';
import { BlogId } from '@subsocial/types/substrate/interfaces';
import { nonEmptyArr, nonEmptyStr } from '@subsocial/utils';
import { Icon, Menu } from 'antd';
import BN from 'bn.js';
import Link from 'next/link';
import React from 'react';

import { SpaceContent } from '../spaces/SpacePreview';
import { DfBgImg } from '../utils/DfBgImg';
import FollowBlogButton from '../utils/FollowBlogButton';
import { SummarizeMd } from '../utils/md';
import { isMyAddress } from '../utils/MyAccountContext';
import { aboutBlogUrl, blogUrl, newBlogUrlFixture } from '../utils/urls';
import AboutBlogLink from './AboutBlogLink';

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
            {/* TODO replace with Next Link + URL builder */}
            <a href={`/search?tab=posts&blogId=${blogId}&tags=${tags.join(',')}`}>{nt.title}</a>
          </Menu.Item>
        )
      }
      case 'url': {
        const url = nt.content.data as string
        return (
          <Menu.Item key={nt.id}>
            {/* TODO replace with Next Link + URL builder if it's Subsocial URL,
            otherwise add 'outer' link icon  */}
            <a href={url}>{nt.title}</a>
          </Menu.Item>
        )
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

  // TODO Fix this hack
  const blog = newBlogUrlFixture(blogId as BlogId)

  return <div className="SpaceNav">
    <div className="SNhead">
      <div className="SNavatar">
        <Link href='/blogs/[blogId]' as={blogUrl(blog)}>
          <a className='DfBlackLink'>
            {nonEmptyStr(image)
              ? <DfBgImg className='DfAvatar' size={imageSize} src={image as string} rounded />
              : <IdentityIcon className='image' size={imageSize} value={creator} />
            }
          </a>
        </Link>
      </div>

      <div className="SNheadTitle">
        <Link href='/blogs/[blogId]' as={blogUrl(blog)}>
          <a className='DfBlackLink'>{name}</a>
        </Link>
      </div>

      <FollowBlogButton blogId={blogId} />

      {nonEmptyStr(desc) &&
        <div className="SNheadDescription">
          <SummarizeMd md={desc} more={
            <AboutBlogLink blog={blog} title={'Learn More'} />
          } />
        </div>
      }
    </div>

    <Menu mode="inline" className="SNmenu">
      {nonEmptyArr(navTabs) &&
        navTabs.map(renderMenuItem)
      }
      <Menu.Item>
        <Link href='/blogs/[blogId]/about' as={aboutBlogUrl(blog)}>
          <a>About</a>
        </Link>
      </Menu.Item>
    </Menu>

    {renderEditMenuLink()}
  </div>
}

export default SpaceNav
