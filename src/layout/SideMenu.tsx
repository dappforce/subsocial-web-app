import React from 'react';

import { Menu, Icon } from 'antd';
import Router, { useRouter } from 'next/router';
import { withMulti } from '@polkadot/ui-api';
import { useMyAccount } from '../components/utils/MyAccountContext';
import ListFollowingBlogs from '../components/blogs/ListFollowingBlogs';
import { isMobile } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';

type MenuItem = {
  name: string,
  page: string,
  image: string
};

const InnerMenu = () => {
  const { toggle } = useSidebarCollapsed();
  const { state: { address: myAddress } } = useMyAccount();
  const router = useRouter();
  const { pathname } = router;

  const onClick = (page: string) => {
    isMobile && toggle();
    Router.push(page).catch(console.log);
  };

  const MenuItems: MenuItem[] = [
    {
      name: 'Feed',
      page: '/feed',
      image: 'profile'
    },
    {
      name: 'All blogs',
      page: '/all',
      image: 'global'
    },
    {
      name: 'New blog',
      page: '/new-blog',
      image: 'plus'
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
    >
      {MenuItems.map(item =>
      <Menu.Item key={item.page} onClick={() => onClick(item.page)}>
        <Icon type={item.image} />
        <span>{item.name}</span>
      </Menu.Item>)}
      <Menu.Divider/>
      <Menu.Item key={'advanced'} >
        <a href='http://subsocial.network:3002'>
        <Icon type='exception' />
          <span>Advanced</span>
        </a>
      </Menu.Item>
      <Menu.Divider/>
        <Menu.ItemGroup className='DfSideMenu--FollowedBlogs' key='followed' title='Followed blogs'>
          <ListFollowingBlogs mini={true} />
        </Menu.ItemGroup>
    </Menu>
  );
};

export default withMulti(
  InnerMenu
);
