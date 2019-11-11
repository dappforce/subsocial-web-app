import React from 'react';

import { Menu, Icon } from 'antd';
import Router from 'next/router';
import { withMulti } from '@polkadot/ui-api';
import { useMyAccount } from '../components/utils/MyAccountContext';
import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';

type MenuItem = {
  name: string,
  route: string,
  image: string
};

type Props = {
  collapsed: boolean
}

const InnerMenu = (props: Props) => {
  const { collapsed } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const MenuItems: MenuItem[] = [
    {
      name: 'All blogs',
      route: '/all',
      image: 'notification'
    },
    {
      name: 'My blogs',
      route: '/my-blogs',
      image: 'notification'
    },
    {
      name: 'Following blogs',
      route: '/following-blogs',
      image: 'notification'
    },
    {
      name: 'Feed',
      route: '/feed',
      image: 'notification'
    },
    {
      name: 'Notifications',
      route: '/notifications',
      image: 'notification'
    },
    {
      name: 'My profile',
      route: `profile${myAddress}`,
      image: 'notification'
    }
  ];

  return (
      <Menu
        defaultSelectedKeys={['1']}
        mode='inline'
        theme='light'
        inlineCollapsed={collapsed}
      >
      <Menu.Item as='a' header style={{ marginRight: '1.5em' }}>
        <Avatar style={{ marginRight: '.5rem' }} src={substrateLogo} />
        <span style={{ fontSize: '1.5rem' }}>Subsocial</span>
      </Menu.Item>
      {MenuItems.map((item, index) =>
      <Menu.Item key={index} onChange={() => Router.push(`/${item.route}`)}>
        <Icon type={item.image} />
        <span>{item.name}</span>
      </Menu.Item>)}
      </Menu>
  );
};

export default withMulti(
  InnerMenu
);
