import React, { useState, useEffect } from 'react';

import { Menu, Icon } from 'antd';
import Router, { useRouter } from 'next/router';
import { useMyAccount } from '../components/utils/MyAccountContext';
import { isMobile } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { api as webApi } from '@polkadot/ui-api';
import { Loading } from '../components/utils/utils';
import { loadBlogData, BlogData } from '../components/blogs/ViewBlog';
import { BlogId } from '../components/types';
import { RenderFollowedList } from '../components/blogs/ListFollowingBlogs';
import { Api } from '../components/utils/SubstrateApi';

type MenuItem = {
  name: string,
  page: string[],
  image: string
};

const InnerMenu = () => {
  const { toggle, state: { collapsed } } = useSidebarCollapsed();
  const { state: { address: myAddress } } = useMyAccount();
  const [ followedBlogsData, setFollowedBlogsData ] = useState([] as BlogData[]);
  const [ loaded, setLoaded ] = useState(false);
  const router = useRouter();
  const { pathname } = router;

  useEffect(() => {
    let isSubscribe = true;

    const loadBlogsData = async () => {
      isSubscribe && setLoaded(false);
      const api = process ? await Api.setup() : webApi;
      const ids = await api.query.blogs.blogsFollowedByAccount(myAddress) as unknown as BlogId[];
      const loadBlogs = ids.map(id => loadBlogData(api,id));
      const blogsData = await Promise.all<BlogData>(loadBlogs);
      isSubscribe && setFollowedBlogsData(blogsData);
      isSubscribe && setLoaded(true);
      console.log('BlogData', blogsData);
    };

    loadBlogsData().catch(console.log);

    return () => { isSubscribe = false; };
  }, [ myAddress ]);

  const onClick = (page: string[]) => {
    isMobile && toggle();
    Router.push(page[0], page[1]).catch(console.log);
  };

  const MenuItems: MenuItem[] = [
    {
      name: 'Feed',
      page: ['/feed'],
      image: 'profile'
    },
    {
      name: 'All blogs',
      page: ['/blogs/all'],
      image: 'global'
    },
    {
      name: 'New blog',
      page: ['/blog/new'],
      image: 'plus'
    },
    {
      name: 'My blogs',
      page: ['/blogs/my/[address]', `/blogs/my/${myAddress}`],
      image: 'book'
    },
    {
      name: 'Following blogs',
      page: ['/blogs/following/[address]', `/blogs/following/${myAddress}`],
      image: 'book'
    },
    {
      name: 'Notifications',
      page: ['/notifications'],
      image: 'notification'
    },
    {
      name: 'My profile',
      page: ['/profile/[address]', `/profile/${myAddress}`],
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
      <Menu.Item key={item.page[0]} onClick={() => onClick(item.page)}>
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
      <Menu.ItemGroup className={`DfSideMenu--FollowedBlogs ${collapsed && 'collapsed'}`} key='followed' title='Followed blogs'>
        {loaded ? <RenderFollowedList followedBlogsData={followedBlogsData} /> : <Loading/>}
      </Menu.ItemGroup>
    </Menu>
  );
};

export default InnerMenu;
