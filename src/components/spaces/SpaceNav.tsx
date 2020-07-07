import IdentityIcon from 'src/components/utils/IdentityIcon';
import AccountId from '@polkadot/types/generic/AccountId';
import { NavTab } from '@subsocial/types/offchain';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { nonEmptyArr, nonEmptyStr } from '@subsocial/utils';
import { Icon, Menu } from 'antd';
import BN from 'bn.js';
import Link from 'next/link';
import React from 'react';

import { SpaceContent } from '../spaces/SpacePreview';
import { DfBgImg } from '../utils/DfBgImg';
import FollowSpaceButton from '../utils/FollowSpaceButton';
import { SummarizeMd } from '../utils/md';
import { isMyAddress } from '../auth/MyAccountContext';
import { aboutSpaceUrl, spaceUrl, newSpaceUrlFixture } from '../utils/urls';
import AboutSpaceLink from './AboutSpaceLink';

export interface SpaceNavProps {
  spaceId: BN,
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
    spaceId,
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
            <a href={`/search?tab=posts&spaceId=${spaceId}&tags=${tags.join(',')}`}>{nt.title}</a>
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
        href='/spaces/[spaceId]/space-navigation/edit'
        as={`/spaces/${spaceId}/space-navigation/edit`}
      >
        <a className='text-secondary'>
          <Icon type="setting" className='mr-2' />
          Edit Menu
        </a>
      </Link>
    </div>

  // TODO Fix this hack
  const space = newSpaceUrlFixture(spaceId as SpaceId)

  return <div className="SpaceNav">
    <div className="SNhead">
      <div className="SNavatar">
        <Link href='/spaces/[spaceId]' as={spaceUrl(space)}>
          <a className='DfBlackLink'>
            {nonEmptyStr(image)
              ? <DfBgImg className='DfAvatar' size={imageSize} src={image as string} rounded />
              : <IdentityIcon className='image' size={imageSize} value={creator} />
            }
          </a>
        </Link>
      </div>

      <div className="SNheadTitle">
        <Link href='/spaces/[spaceId]' as={spaceUrl(space)}>
          <a className='DfBlackLink'>{name}</a>
        </Link>
      </div>

      <FollowSpaceButton spaceId={spaceId} />

      {nonEmptyStr(desc) &&
        <div className="SNheadDescription">
          <SummarizeMd md={desc} more={
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

    {renderEditMenuLink()}
  </div>
}

export default SpaceNav
