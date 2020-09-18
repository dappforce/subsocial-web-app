import React from 'react';
import { PostWithSomeDetails } from '@subsocial/types';
import { Menu, Dropdown, Button } from 'antd';
import { ShareLink, Copy } from 'src/components/urls/helpers';
import { facebookShareUrl, postUrl, twitterShareUrl, linkedInShareUrl, redditShareUrl, copyUrl } from 'src/components/urls';
import { IconWithLabel } from 'src/components/utils';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  RedditOutlined,
  ShareAltOutlined,
  LinkOutlined
} from '@ant-design/icons'
import SpaceShareLink from '../SpaceShareLink';
import { Space } from '@subsocial/types/substrate/interfaces';

import styles from './index.module.sass'

type ShareMenuProps = {
  postDetails: PostWithSomeDetails,
  space: Space,
  preview?: boolean,
  title?: string
  className?: string,
}

type SomeShareLink = {
  url: string,
  title?: string,
  summary?: string
}

const FacebookShareLink = ({ url }: SomeShareLink) => <ShareLink url={facebookShareUrl(url)}>
  <IconWithLabel icon={<FacebookOutlined />} label='Facebook' />
</ShareLink>

const TwitterShareLink = ({ url, title }: SomeShareLink) => <ShareLink url={twitterShareUrl(url, title)}>
  <IconWithLabel icon={<TwitterOutlined />} label='Twitter' />
</ShareLink>

const LinkedInShareLink = ({ url, title, summary }: SomeShareLink) => <ShareLink url={linkedInShareUrl(url, title, summary)}>
  <IconWithLabel icon={<LinkedinOutlined />} label='LinkedIn' />
</ShareLink>

const RedditShareLink = ({ url, title }: SomeShareLink) => <ShareLink url={redditShareUrl(url, title)}>
  <IconWithLabel icon={<RedditOutlined />} label='Reddit' />
</ShareLink>

const CopyLink = ({ url }: SomeShareLink) => <Copy text={copyUrl(url)} message='Link copied'>
  <IconWithLabel icon={<LinkOutlined />} label='Copy link' />
</Copy>

const ShareMenu = (props: ShareMenuProps) => {
  const { postDetails: { post }, space } = props
  const currentPostUrl = postUrl(space, post.struct)
  const title = post.content?.title
  const summary = post.content?.body

  return <Menu selectable={false} mode='horizontal' className={styles.DfShareDropdown}>
    <Menu.ItemGroup title="Share to:">
      <Menu.Item>
        <SpaceShareLink {...props} />
      </Menu.Item>
      <Menu.Item>
        <FacebookShareLink url={currentPostUrl} />
      </Menu.Item>
      <Menu.Item>
        <TwitterShareLink url={currentPostUrl} title={title} />
      </Menu.Item>
      <Menu.Item>
        <LinkedInShareLink url={currentPostUrl} title={title} summary={summary} />
      </Menu.Item>
      <Menu.Item>
        <RedditShareLink url={currentPostUrl} title={title} summary={summary} />
      </Menu.Item>
      <Menu.Item>
        <CopyLink url={currentPostUrl} />
      </Menu.Item>
    </Menu.ItemGroup>
  </Menu>
}

export const ShareDropdown = (props: ShareMenuProps) => {
  const { preview, title = 'Share', className, postDetails: { post: { struct: { shares_count } } } } = props
  return <Dropdown
    trigger={[ 'click', 'hover' ]}
    placement='bottomCenter'
    overlay={<ShareMenu {...props} />}>
    <Button
      className={className}
      title={preview ? title : undefined}
      style={{ marginRight: !preview ? '-1rem' : '' }}
    >
      <IconWithLabel icon={<ShareAltOutlined />} count={shares_count} label={!preview ? title : undefined} />
    </Button>
  </Dropdown>
}
