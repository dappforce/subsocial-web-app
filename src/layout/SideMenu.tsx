import React, { useState, useEffect } from 'react';
import { Menu, Icon, Badge } from 'antd';
import Router, { useRouter } from 'next/router';
import { useIsLoggedIn, useMyAddress } from '../components/utils/MyAccountContext';
import { isMobile } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { Loading } from '../components/utils/utils';
import { RenderFollowedList } from '../components/blogs/ListFollowingBlogs';
import { useSubsocialApi } from '../components/utils/SubsocialApiContext'
import Link from 'next/link';
import { BlogData } from '@subsocial/types/dto';
import { newLogger } from '@subsocial/utils';
import { useNotifCounter } from '../components/utils/NotifCounter';
import { buildAuthorizedMenu, DefaultMenu, isDivider, PageLink } from './SideMenuItems';

const log = newLogger('SideMenu')

const InnerMenu = () => {
  const { subsocial, substrate } = useSubsocialApi();
  const { toggle, state: { collapsed, triggerFollowed } } = useSidebarCollapsed();
  const { pathname } = useRouter();
  const myAddress = useMyAddress();
  const isLoggedIn = useIsLoggedIn();
  const { unreadCount } = useNotifCounter()

  const [ followedBlogsData, setFollowedBlogsData ] = useState<BlogData[]>([]);
  const [ loaded, setLoaded ] = useState(false);

  useEffect(() => {
    if (!myAddress) return;

    let isSubscribe = true;

    const loadBlogsData = async () => {
      setLoaded(false);
      const ids = await substrate.blogIdsFollowedByAccount(myAddress)
      const blogsData = await subsocial.findBlogs(ids);
      if (isSubscribe) {
        setFollowedBlogsData(blogsData);
        setLoaded(true);
      }
    };

    loadBlogsData().catch(err =>
      log.error('Failed to load blogs followed by the current user:', err));

    return () => { isSubscribe = false; };
  }, [ triggerFollowed, myAddress ]);

  const menuItems = isLoggedIn && myAddress
    ? buildAuthorizedMenu(myAddress)
    : DefaultMenu

  const goToPage = ([ url, as ]: string[]) => {
    isMobile && toggle()
    Router.push(url, as).catch(err =>
      log.error('Failed to navigate to a selected page:', err))
  }

  const renderNotificationsBadge = () => {
    if (!unreadCount || unreadCount <= 0) return null
    return <Badge count={unreadCount} className="site-badge-count-4" />
  }

  const renderPageLink = (item: PageLink) => {
    return item.isAdvanced
      ? (
        <Menu.Item key={item.page[0]} >
          <a href='/bc'>
            <Icon type='block' />
            <span>Advanced</span>
          </a>
        </Menu.Item>
      ) : (
        <Menu.Item key={item.page[0]} onClick={() => goToPage(item.page)}>
          <Link href={item.page[0]} as={item.page[1]}>
            <a>
              <Icon type={item.image} />
              <span>{item.name}</span>
              {item.isNotifications && renderNotificationsBadge()}
            </a>
          </Link>
        </Menu.Item>
      )
  }

  const renderSubscriptions = () => <>
    <Menu.Divider />
    <Menu.ItemGroup
      className={`DfSideMenu--FollowedBlogs ${collapsed && 'collapsed'}`}
      key='followed'
      title='My subscriptions'
    >
      {loaded
        ? <RenderFollowedList followedBlogsData={followedBlogsData} />
        : <Loading />
      }
    </Menu.ItemGroup>
  </>

  return (
    <Menu
      selectedKeys={[ pathname ]}
      mode='inline'
      theme='light'
      style={{ height: '100%', borderRight: 0 }}
    >
      {menuItems.map(item => isDivider(item)
        ? <Menu.Divider />
        : renderPageLink(item)
      )}
      {isLoggedIn && renderSubscriptions()}
    </Menu>
  );
};

export default InnerMenu;
