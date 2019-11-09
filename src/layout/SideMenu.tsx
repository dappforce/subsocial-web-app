import React, { useState } from 'react';
import { Menu, Label } from 'semantic-ui-react';
import Router from 'next/router';
import { withMulti, withCalls } from '@polkadot/ui-api';
import { queryBlogsToProp } from '../components/utils';
import BN from 'bn.js';
import { useMyAccount } from '../components/utils/MyAccountContext';

type Props = {
  active?: string,
  nextBlogId: BN
};

const InnerMenu = (props: Props) => {
  const { active = '', nextBlogId } = props;
  const [ activeItem, setActive ] = useState(active);
  const { state: { address: myAddress } } = useMyAccount();
  let blogCount = nextBlogId ? nextBlogId.sub(new BN(1)).toNumber() : 0;

  const handleItemClick = (e: any, data: any) => {
    setActive(data.name);
  };

  return (
      <Menu fluid vertical tabular>
        <Menu.Item
          name='all'
          active={activeItem === 'all'}
          onClick={(e, data) => {
            handleItemClick(e, data);
            Router.push(`/${data.name}`).catch(console.log);
          }}
        >
          <Label>{blogCount}</Label>
          All blogs
        </Menu.Item>

        <Menu.Item
          name='my-blogs'
          active={activeItem === 'my-blogs'}
          onClick={(e, data) => {
            handleItemClick(e, data);
            Router.push(`/${data.name}`).catch(console.log);
          }}
        >
          My blogs
        </Menu.Item>

        <Menu.Item
          name='following-blogs'
          active={activeItem === 'following-blogs'}
          onClick={(e, data) => {
            handleItemClick(e, data);
            Router.push(`/${data.name}`).catch(console.log);
          }}
        >
          Following blogs
        </Menu.Item>

        <Menu.Item
          name='new-blog'
          active={activeItem === 'new-blog'}
          onClick={(e, data) => {
            handleItemClick(e, data);
            Router.push(`/${data.name}`).catch(console.log);
          }}
        >
          New Blog
        </Menu.Item>

        <Menu.Item
          name='feed'
          active={activeItem === 'feed'}
          onClick={(e, data) => {
            handleItemClick(e, data);
            Router.push(`/${data.name}`).catch(console.log);
          }}
        >
          Feed
        </Menu.Item>

        <Menu.Item
          name='notifications'
          active={activeItem === 'notifications'}
          onClick={(e, data) => {
            handleItemClick(e, data);
            Router.push(`/${data.name}`).catch(console.log);
          }}
        >
          Notification
        </Menu.Item>

        <Menu.Item
          name={`profile/${myAddress}`}
          active={activeItem === `profile/${myAddress}`}
          onClick={(e, data) => {
            handleItemClick(e, data);
            Router.push(`/profile?address=${myAddress}`).catch(console.log);
          }}
        >
          My profile
        </Menu.Item>
      </Menu>
  );
};

export default withMulti(
  InnerMenu,
  withCalls<Props>(
    queryBlogsToProp('nextBlogId')
  )
);
