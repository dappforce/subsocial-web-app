import React from 'react'
import Link from 'next/link'
import { Menu, Icon } from 'antd'
import FollowBlogButton from '../utils/FollowBlogButton'
import { nonEmptyStr, nonEmptyArr, isEmptyStr } from '@subsocial/utils'
import { DfBgImg } from '../utils/DfBgImg'
import { SpaceContent } from '../spaces/SpacePreview'
import BN from 'bn.js'
import AccountId from '@polkadot/types/generic/AccountId'
import { NavTab } from '@subsocial/types/offchain'
import { IdentityIcon } from '@polkadot/react-components'
import { isMyAddress } from '../utils/MyAccountContext'


import truncate from 'lodash.truncate'
import mdToText from 'markdown-to-txt'

export const DEFAULT_SUMMARY_LENGTH = 300

export const SEPARATOR = /[.,:;!?()[]{}\s]+/

/** Shorten a plain text up to `limit` chars. Split by separators. */
export const summarize = (
  text: string,
  limit: number = DEFAULT_SUMMARY_LENGTH
): string => {
  if (isEmptyStr(text)) return ''

  text = text.trim()

  return text.length <= limit
    ? text
    : truncate(text, {
      length: limit,
      separator: SEPARATOR
    })
}

/**
 * Markdown options:
 *
 * @escapeHtml (default: true) Escapes HTML in the final string
 * @gfp (default: true) Uses github flavor markdown (passed through to marked)
 * @pedantic (default: false) Conform to markdown.pl (passed through to marked)
 */
export type MdOpts = {
  escapeHtml?: boolean
  gfm?: boolean
  pedantic?: boolean
}

export const DEFAULT_MARKDOWN_OPTIONS: MdOpts = { escapeHtml: false }

/** Shorten a markdown text up to `limit` chars. Split by separators. */
export const summarizeMd = (
  mdText: string,
  mdOpts: MdOpts = DEFAULT_MARKDOWN_OPTIONS,
  limit: number = DEFAULT_SUMMARY_LENGTH
): string => {
  const text = mdToText(mdText, mdOpts)
  return summarize(text, limit)
}


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

      {nonEmptyStr(desc) &&
        <div className="SNheadDescription">{summarizeMd(desc)}</div>
      }
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
