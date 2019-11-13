import React from 'react';

import { Menu, Icon } from 'antd';
import Router, { useRouter } from 'next/router';
import { withMulti } from '@polkadot/ui-api';
import { useMyAccount } from '../components/utils/MyAccountContext';

type MenuItem = {
  name: string,
  page: string,
  image: string
};

type Props = {
  collapsed: boolean
};

const InnerMenu = (props: Props) => {
  const { collapsed } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const router = useRouter();
  const { pathname } = router;

  const MenuItems: MenuItem[] = [
    {
      name: 'All blogs',
      page: '/all',
      image: 'global'
    },
    {
      name: 'My blogs',
      page: '/my-blogs',
      image: 'book'
    },
    {
      name: 'Following blogs',
      page: '/following-blogs',
      image: 'book'
    },
    {
      name: 'Feed',
      page: '/feed',
      image: 'profile'
    },
    {
      name: 'Notifications',
      page: '/notifications',
      image: 'notification'
    },
    {
      name: 'My profile',
      page: `/profile?address=${myAddress}`,
      image: 'idcard'
    }
  ];

  return (
      <Menu
        defaultSelectedKeys={[pathname || '/all']}
        mode='inline'
        theme='light'
        style={{ height: '100%', borderRight: 0 }}
        inlineCollapsed={collapsed}
      >
      {MenuItems.map(item =>
      <Menu.Item key={item.page} onClick={() => Router.push(item.page)}>
        <Icon type={item.image} />
        <span>{item.name}</span>
      </Menu.Item>)}
      </Menu>
  );
};

export default withMulti(
  InnerMenu
);
