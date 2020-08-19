import IdentityIcon from 'src/components/utils/IdentityIcon';
import { NavTab } from '@subsocial/types/offchain';
import { nonEmptyArr, nonEmptyStr } from '@subsocial/utils';
import { Menu } from 'antd';
import BN from 'bn.js';
import Link from 'next/link';
import React from 'react';

import { DfBgImg } from '../utils/DfBgImg';
import FollowSpaceButton from '../utils/FollowSpaceButton';
import { SummarizeMd } from '../utils/md';
import { aboutSpaceUrl, spaceUrl } from '../utils/urls';
import AboutSpaceLink from './AboutSpaceLink';
import { DropdownMenu, EditMenuLink } from './helpers';
import { SpaceData } from '@subsocial/types/dto'

export type SpaceContent = {
  spaceId: BN,
  title: string,
  isFollowing: boolean
}

export interface SpaceNavProps {
  spaceData: SpaceData,
  imageSize?: number,
  linkedSpaces?: {
    teamMembers?: SpaceContent[]
    projects?: SpaceContent[]
  }
}

export const SpaceNav = (props: SpaceNavProps) => {
  const {
    spaceData,
    imageSize = 100
  } = props;

  const {
    struct: space,
    content
  } = spaceData

  if (!content) return null;

  const { id, owner } = space
  const { about, image, navTabs, name } = content

  const renderMenuItem = (nt: NavTab) => {
    switch (nt.type) {
      case 'by-tag': {
        const tags = nt.content.data as string[]
        return (
          <Menu.Item key={nt.id}>
            {/* TODO replace with Next Link + URL builder */}
            <a href={`/search?tab=posts&spaceId=${id}&tags=${tags.join(',')}`}>{nt.title}</a>
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

  return <div className="SpaceNav">
    <div className="SNhead">
      <div className="SNavatar">
        <Link href='/spaces/[spaceId]' as={spaceUrl(space)}>
          <a className='DfBlackLink'>
            {nonEmptyStr(image)
              ? <DfBgImg className='DfAvatar' size={imageSize} src={image as string} rounded />
              : <IdentityIcon className='image' size={imageSize} value={owner} />
            }
          </a>
        </Link>
      </div>

      <div className="SNheadTitle">
        <Link href='/spaces/[spaceId]' as={spaceUrl(space)}>
          <a className='DfBlackLink'>{name}</a>
        </Link>
      </div>

      <span className='d-flex justify-content-center align-items-center'>
        <FollowSpaceButton spaceId={id} block />
        <DropdownMenu spaceData={spaceData} vertical style={{ marginLeft: '.5rem', marginRight: '-.5rem' }} />
      </span>

      {nonEmptyStr(about) &&
        <div className="SNheadDescription">
          <SummarizeMd md={about} more={
            <AboutSpaceLink space={space} title={'Learn More'} />
          } />
        </div>
      }
    </div>

    <Menu mode="inline" className="SNmenu">
      {nonEmptyArr(navTabs) &&
        navTabs.map(renderMenuItem)
      }
      <Menu.Item>
        <Link href='/spaces/[spaceId]/about' as={aboutSpaceUrl(space)}>
          <a>About</a>
        </Link>
      </Menu.Item>
    </Menu>

    <EditMenuLink space={space} withIcon />
  </div>
}

export default SpaceNav
